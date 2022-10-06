import { CustomInputAxis, InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable3D } from "./src/Renderables/Renderables";
import * as utils from "./src/utilities";
import { Vector, vec, vec4 } from "./src/Transform/Vector";
import { SupersonicJS } from "./src/supersonic";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { ObjParser } from "./src/Parsers/ObjParser";
import { Flat3D, Shaded3D } from "./src/Shaders/3DShader";
import { Camera, ProjectionType } from "./src/Camera";
import { PBRShader } from "./src/Shaders/PBR";
import { Texture } from "./src/Renderables/Texture";
import { BufferSonic } from "./src/Abstraction/Buffer";
import { Loader } from "./src/Loader/Loader";
import { XBOX_ANALOG_INPUTS, XBOX_ANALOG_RAW, XBOX_DIGITAL_INPUTS } from "./src/InputManager/Controller";

let avgFps = 0;
let framerateCalcs = 0;
let framecount = 0;
let lastFrameCount = 0;
let lastDate = Date.now();
let halt = false;

window["resetFrameCount"] = () =>
{
	framecount = 0;
	lastFrameCount = 0;
	avgFps = 0;
	framerateCalcs = 0;
}

window["replaceObj"] = async (path : string) => 
{
	halt = true;
	let meshRaw = Loader.LoadHTTP(path);
	if (meshRaw=="404")
	{
		meshRaw = await HTTP_REQUEST(path);
	}

	let meshData = ObjParser.parse(meshRaw);
	delete cube.components;
	cube.components = [];
	let mesh = new GeometryRenderable3D(
		gl,
		meshData.vertices,
		meshData.indices,
		meshData.normals,
		meshData.textures,
		cubeShader
	);

	mesh.name = "MESH";
	cube.addComponent(mesh, gl);
	halt = false;
	requestAnimationFrame(draw);
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


let cube: Entity;
let cubeShader : Shaded3D;
let light: Entity;
let lightShader: Flat3D;

let camera: Camera;
let cameraMovementInput: InputAxis;

let inputManager: InputManager;

let gl: WebGL2RenderingContext;

async function setup()
{
	// vec and vec4 are shorthand for new Vector and new Vector4
	gl = SupersonicJS.init("glCanvas", vec4(0.1, 0.1, 0.1, 1));
	let startupTime = Date.now();

	// Lock cursor to canvas
	utils.PointerLock.Lock("glCanvas");
	// Request Object Mesh
	let sceneText = await HTTP_REQUEST("/Models/scene_test.obj");
	console.log("SCENE DOWNLOADED")
	let LightText = await HTTP_REQUEST("/Models/example.obj");
	console.log("CUBE DOWNLOADED")
	// Parse raw text to get MeshData
	let sceneMesh = ObjParser.parse(sceneText);
	console.log("SCENE PARSED");
	let lightMesh = ObjParser.parse(LightText);
	console.log("LIGHT PARSED")


	// Prepare Camera
	camera = new Camera(ProjectionType.PERSPECTIVE, 90, vec(-2, -2, -2));
	camera.speed = 1;
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

	// Add Renderable to Entity
	cube.addComponent(
		new GeometryRenderable3D(
			gl,
			sceneMesh.vertices,
			sceneMesh.indices,
			sceneMesh.normals,
			sceneMesh.textures,
			cubeShader
		),
		gl
	)
	cube.components[0].name = "MESH";
	console.log("SCENE INITIALISED")



	lightShader = Flat3D.create(gl);
	lightShader.setColour(vec4(1, 1, 1, 1));
	light = new Entity("Light");
	light.transform.position = vec(0, 0, 2);
	light.transform.scale.set(0.5);
	console.log(sceneMesh.textures)
	light.addComponent(
		new GeometryRenderable3D(
			gl,
			lightMesh.vertices,
			lightMesh.indices,
			lightMesh.normals,
			lightMesh.textures,
			lightShader
		),
		gl
	);
	console.log("LIGHT INITIALISED")

	// cubeShader.material.shininess = 32;


	cubeShader.light.ambient.set(0.2);

	camera.far = 1000;

	cubeShader.light.diffuse.set(0.5);
	cubeShader.light.specular.set(0.6);


	cubeShader.light.position = light.transform.position;
	cubeShader.viewPos = camera.transform.position;
	cubeShader.material.setColour(vec().set(0.25));

	// Call draw on frame update
	// Texture.load(gl, "/images/test.png").then(texture =>
	// {
	// 	cubeShader.material.diffuse = texture;
	// 	cubeShader.material.specular = texture;
	// 	console.log(texture)
	// 	dt = Date.now();
	console.log("SETUP DONE!");
	cubeShader.updateUniforms(gl);
	setInterval(draw, 1000/120)
	setInterval(calculateFramerate, 1000);
	startupTime = Date.now() - startupTime;
	startupTime /= 1000;
	console.log(`STARTUP TOOK ${startupTime} SECONDS`)
	Loader.Free();
	// })
}

let dt = Date.now();
function draw()
{
	let delta = (Date.now() - dt);
	dt = Date.now();
	// Do stuff that isnt  drawing
	light.transform.position.set(Math.sin(framecount / 60) * 4, 0, Math.cos(framecount / 60) * 4);
	cubeShader.updateUniforms(gl);

	framecount++;
	// Clear background
	SupersonicJS.clear(gl);

	// Move Camera
	if (inputManager.mainController != "NONE")
	{
		let controller = inputManager.controllers[inputManager.mainController];

		if (controller.getButton(XBOX_DIGITAL_INPUTS.A).pressed)
		{
			camera.speed = 8
		} else
		{
			camera.speed = 4;
		}

		let zoom = controller.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_TRIGGER);
		camera.fov = 90 + (90 * (controller.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_TRIGGER) + 1))

		let rotationVec = controller.getAnalogStick(XBOX_ANALOG_INPUTS.RIGHT_STICK)
		rotationVec.div(delta * 2);
		rotationVec = vec(rotationVec.y, rotationVec.x);

		camera.transform.rotation.add(rotationVec);

		let movementVec = controller.getAnalogStick(XBOX_ANALOG_INPUTS.LEFT_STICK)
		movementVec.mult(vec(-1, -1));
		movementVec.z = movementVec.y;
		movementVec.y = 0;
		movementVec.div(delta)
		camera.freecam(new CustomInputAxis(movementVec.x, movementVec.z));
	} else {
		camera.speed = 1;
		camera.freecam(cameraMovementInput);
	}
	// Draw cube
	cube.draw_tick(gl, camera);

	// Draw light
	light.draw_tick(gl, camera);

	// Call draw again
	// if (!halt) { requestAnimationFrame(draw.bind(this)) }
}

Loader.CacheImage("/images/test.png");
PBRShader.Register();
Flat3D.Register();
Loader.CacheHTTP("/Models/example.obj");
Loader.CacheHTTP("/Models/scene_test.obj");
Loader.LoadAll().then(setup);