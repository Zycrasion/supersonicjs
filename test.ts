import * as glmat from "gl-matrix";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable2D, GeometryRenderable3D } from "./src/Renderables/Renderables";
import { FlatShader } from "./src/Shaders/FlatShader";
import { ImageShader } from "./src/Shaders/ImageShader";
import { Shader } from "./src/Shaders/Shader";
import * as utils from "./src/utilities";
import { Vector, Vector4, vec, vec4 } from "./src/Transform/Vector";
import { SupersonicJS } from "./src/supersonic";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { SquareMesh } from "./src/Renderables/DefaultMeshes/square";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { ObjParser } from "./src/Parsers/ObjParser";
import { Shader3D, Shaded3D, Flat3D } from "./src/Shaders/3DShader";
import { Transform } from "./src/Transform/Transform";
import { off } from "process";
import { Camera, ProjectionType } from "./src/Camera";
import { Loader } from "./src/Loader/Loader";

let avgFps = 0;
let framerateCalcs = 0;
let framecount = 0;
let lastFrameCount = 0;
let lastDate = Date.now();

window["resetFrameCount"] = () => {
	framecount = 0;
	lastFrameCount = 0;
	avgFps = 0;
	framerateCalcs = 0;
}

function calculateFramerate()
{
	let difference = framecount - lastFrameCount;
	let fps = difference / (Date.now() - lastDate) * 1000;

	avgFps += fps;
	framerateCalcs += 1;
	console.log("AVG FPS:", avgFps / framerateCalcs, " FPS:", fps);

	lastDate = Date.now();
	lastFrameCount = framecount;
}

setInterval(calculateFramerate, 1000)

let cube: Entity;
let cubeShader: Shaded3D;

let light: Entity;
let lightShader: Flat3D;

let camera: Camera;
let cameraMovementInput: InputAxis;

let inputManager: InputManager;

let gl: WebGL2RenderingContext;

function setup()
{
	// vec and vec4 are shorthand for new Vector and new Vector4
	gl = SupersonicJS.init("glCanvas", vec4(0.1, 0.1, 0.1, 1));

	// Lock cursor to canvas
	utils.PointerLock.Lock("glCanvas");

	// Request Object Mesh
	HTTP_REQUEST("/Models/example.obj").then(text =>
	{
		// Parse raw text to get MeshData
		let MeshData = ObjParser.parse(text);

		// Prepare Camera
		camera = new Camera(ProjectionType.PERSPECTIVE, 90, vec(-2, -2, -2));

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
		cubeShader.material.Ambient = vec(0.25,0.25,0.25);
        cubeShader.material.Diffuse = vec(0.25,0.25,0.25);
        cubeShader.material.Specular = vec(0.25,0.25,0.25);
        cubeShader.material.Shiny = 32;
		cubeShader.LightColour = vec(0.25, 1, 0.56);
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

		lightShader = Flat3D.create(gl);
		lightShader.setColour(vec4(1, 1, 1, 1));
		light = new Entity("Light");
		light.transform.position = vec(0,0,2);
		light.transform.scale.set(0.5);

		light.addComponent(
			new GeometryRenderable3D(
				gl,
				MeshData.vertices,
				MeshData.indices,
				MeshData.normals,
				MeshData.textures,
				lightShader
			),
			gl
		);
		
		cubeShader.LightColour = ((light.components[0] as GeometryRenderable3D).shader as Flat3D).getColour();
		cubeShader.LightPosition = light.transform.position; // Javascript will make this a pointer
		cubeShader.viewPos = camera.transform.position;

		// Call draw on frame update
		requestAnimationFrame(draw.bind(this))
	})
}

function draw()
{

	// Do stuff that isnt  drawing
	light.transform.position.set(Math.sin(framecount / 60)*4,0,Math.cos(framecount / 60)*4);

	framecount++;
	// Clear background
	SupersonicJS.clear(gl);

	// Move Camera
	camera.freecam(cameraMovementInput);

	// Draw cube
	cube.draw_tick(gl, camera);

	// Draw light
	light.draw_tick(gl, camera);

	// Call draw again
	requestAnimationFrame(draw.bind(this))
}

setup();