import { Camera, ProjectionType } from "./src/Camera";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { ObjParser } from "./src/Parsers/ObjParser";
import { GeometryRenderable3D } from "./src/Renderables/Renderables";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Shaded3D } from "./src/Shaders/3DShader";
import { SupersonicJS } from "./src/supersonic";
import { vec, vec4 } from "./src/Transform/Vector";
import { PointerLock } from "./src/utilities";

let cube: Entity;
let cubeShader: Shaded3D;

let camera: Camera;
let cameraMovementInput: InputAxis;

let inputManager: InputManager;

let gl: WebGL2RenderingContext;

function setup()
{
    // vec and vec4 are shorthand for new Vector and new Vector4
    gl = SupersonicJS.init("glCanvas", vec4(0.1,0.1,0.1,1));

    // Lock cursor to canvas
    PointerLock.Lock("glCanvas");

    // Request Object Mesh
    HTTP_REQUEST("/Models/example.obj").then(text =>
    {
        // Parse raw text to get MeshData
        let MeshData = ObjParser.parse(text);

        // Prepare Camera
        camera = new Camera(ProjectionType.PERSPECTIVE, 90, vec(2, 2, 2));

        // Create Input Events
        inputManager = new InputManager()
        // Create input "axis" for camera
        cameraMovementInput = new InputAxis(inputManager, "d", "a", "w", "s");
        // Hook Mouse move events to camera
        camera.hook_freelook();
        // camera.unhook_freelook(); To stop monitoring mouse movement

        // Create an Entity with the name "Cube"
        cube = new Entity("Cube");

        // Setup Shader
        cubeShader = Shaded3D.create(gl);
        cubeShader.material.ambient = vec(0.25,0.25,0.25);
        cubeShader.material.diffuse = vec(0.25,0.25,0.25);
        cubeShader.material.specular = vec(0.25,0.25,0.25);
        cubeShader.material.shiny = 32;
        cubeShader.light.setColour(vec(0.25, 1, 0.56));
        cubeShader.light.position = cube.transform.position.copy().add(vec(0, 0, 1));
        cubeShader.viewPos = camera.transform.position;

        // Add Renderable to Entity
        cube.addComponent(
            new GeometryRenderable3D(
                gl,
                MeshData.vertices,
                MeshData.indices,
                MeshData.normals,
                MeshData.textures,
                cubeShader
            ),
            gl
        )


        // Call draw on frame update
        requestAnimationFrame(draw.bind(this))
    })
}

function draw()
{
    // Clear background
    SupersonicJS.clear(gl);

    // Move Camera
    camera.freecam(cameraMovementInput);
    
    // Draw cube
    cube.draw_tick(gl, camera);

    // Call draw again
    requestAnimationFrame(draw.bind(this))
}

setup();