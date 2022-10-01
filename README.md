# SupersonicJS
Status: Beta v0.3.4

Polishing Code/Refactoring

For the forseeable future i will probably get to Version 0.2.0 then take a break making some games and come back and have a heap of features to implement.

## Getting Started (NOTE: You should have an understanding of javascript/typescript before trying the engine. its currently more like an abstraction layer on top of WebGL.)
clone the repo 
`git clone https://github.com/Zycrasion/supersonicjs.git`
`cd supersonicjs`
now do
`npm run build`
in tsBuild/ there is the source for the engine and the test
engine source is under src/
you can copy that into your project and import from that
but currently its not on npm

The code:
in an html file somewhere have a canvas with any id like:
`<canvas id="glCanvas" width="720" height="480"></canvas>`
in a typescript file (note: i will not be going through how to browserify this)
(example.ts)
```ts
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
        cubeShader.setColour(vec4(1, 1, 1, 1));
        cubeShader.LightColour = vec(0.25, 1, 0.56);
        cubeShader.LightPosition = cube.transform.position.copy().add(vec(0, 0, 1));
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
```

## Known Bugs
- Sometimes the light wont draw due to only supplying 4 vertices?


## Changelog
- ADDED SonicBuffer
- ADDED VertexArray
- FIXED Shaders not supplying enough data
- FIXED Camera console.log
- ADDED Scenes
- ADDED Parenting
- ADDED Enities
- ADDED Components
- ADDED Vector.add
- ADDED Vector.sub
- ADDED Vector.mult
- ADDED ToFloatArray
- ADDED ToFloat64Array
- CHANGED WebGL Version to WebGL2
- CHANGED Shaders
- CHANGED File locations
- ADDED SquareMesh preset
- FIXED README.md typo 'VERSOIN' to 'VERSION' 
- REMOVED ROADMAPS

## Changelog (VERSION 0.1.*)
- FIXED Warnings coming from WEBGL by only drawing if shader has loaded
- ADDED Loading GLSL from files
- FIXED Filtering not working
- FIXED Images sometimes will not load because of isPowerOf2
- Added SupersonicJS main file
- Added `SupersonicJS.init()` and `.clear()`

## Changelog (VERSION 0.1.0)
- Added FlatShader Usage `new FlatShader(gl, red, green, blue, alpha)` then use like any other shader, rgb values are able to be changed on demand
- Added ImageShader, Usage `new ImageShader(gl, imagePath, uvCoordinates?, filtering?)` use like any other shader
- Added Scale Paremeter to `ProjectionMatrix.orthographic(gl, scale)`
- Added InputAxis for making easy vector addition for movement
- Added InputManager for using Input
- FIXED Images repeating when they aren't supposed to