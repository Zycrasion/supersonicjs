import { CustomInputAxis, InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable } from "./src/Renderables/Renderables";
import * as utils from "./src/utilities";
import { vec, vec4 } from "./src/Transform/Vector";
import { SupersonicJS } from "./src/supersonic";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { ObjParser } from "./src/Parsers/ObjParser";
import { Flat3D, Shaded3D } from "./src/Shaders/3DShader";
import { Camera, ProjectionType } from "./src/Camera";
import { PBRShader } from "./src/Shaders/PBR";
import { Loader } from "./src/Loader/Loader";
import { XBOX_ANALOG_INPUTS, XBOX_ANALOG_RAW, XBOX_DIGITAL_INPUTS } from "./src/InputManager/Controller";
import { Scene } from "./src/EntityComponentSystem/Scene";

let avgFps = 0;
let framerateCalcs = 0;
let framecount = 0;
let lastFrameCount = 0;
let lastDate = Date.now();

window["resetFrameCount"] = () =>
{
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


let light: Entity;
let lightShader: Flat3D;
let scene: Scene;

let camera: Camera;
let cameraMovementInput: InputAxis;

let inputManager: InputManager;

let gl: WebGL2RenderingContext;

async function setup()
{
	// vec and vec4 are shorthand for new Vector and new Vector4
	gl = SupersonicJS.init("glCanvas", vec4(0.1, 0.1, 0.1, 1));
	let startupTime = Date.now();

	scene = new Scene();

	// Lock cursor to canvas
	utils.PointerLock.Lock("glCanvas");
	// Request Object Mesh
	let sceneText = await HTTP_REQUEST("/Models/scene_test.obj");
	console.log("SCENE DOWNLOADED")
	let LightText = await HTTP_REQUEST("/Models/example.obj");
	console.log("CUBE DOWNLOADED")
	// Parse raw text to get MeshData
	let sceneMeshes = ObjParser.parseAll(sceneText);
	console.log("SCENE PARSED");
	let lightMesh = ObjParser.parseOne(LightText);
	console.log("LIGHT PARSED")

	camera = new Camera(ProjectionType.PERSPECTIVE, 90, vec(-2, -2, -2))

	let groundShader = Shaded3D.create(gl);
	groundShader.material.ambient = vec(29, 79, 17).div(255);
	groundShader.material.diffuse = vec(27, 135, 1).div(255);
	groundShader.material.specular = vec(255, 255, 255).div(255);
	groundShader.viewPos = camera.transform.position;

	let waterShader = Shaded3D.create(gl);
	waterShader.material.ambient = vec(7, 31, 66).div(255);
	waterShader.material.diffuse = vec(1, 99, 135).div(255);
	waterShader.material.specular = vec(255, 255, 255).div(255);
	waterShader.viewPos = camera.transform.position;
	
	for (let mesh of sceneMeshes)
	{
		let object = new Entity(mesh.name);
		let geometry: GeometryRenderable;

		let shaderDeterminator = object.name.split("_");
		if (shaderDeterminator[shaderDeterminator.length - 1] == "water")
		{
			geometry = new GeometryRenderable(gl, mesh, waterShader);
		} else
		{
			geometry = new GeometryRenderable(gl, mesh, groundShader);
		}

		object.addComponent(geometry, gl);
		object.transform.scale.set(10);
		scene.addEntity(object);
	}
	console.log(scene.Entities);


	// Prepare Camera
	camera.speed = 1;
	// Create Input Events
	inputManager = new InputManager()
	// Create input "axis" for camera
	cameraMovementInput = new InputAxis(inputManager, "d", "a", "w", "s");
	// Hook Mouse move events to camera
	camera.hook_freelook();
	// camera.unhook_freelook(); To stop monitoring mouse movement
	scene.MainCamera = camera;

	lightShader = Flat3D.create(gl);
	lightShader.setColour(vec4(1, 1, 1, 1));
	light = new Entity("Light");
	light.transform.position = vec(0, 2, 2);
	light.transform.scale.set(0.5);
	light.addComponent(
		new GeometryRenderable(
			gl,
			lightMesh,
			lightShader
		),
		gl
	);

	groundShader.light.setColour(vec(1,1,1));
	waterShader.light = groundShader.light;
	
	groundShader.light.position = light.transform.position;

	console.log("LIGHT INITIALISED")
	scene.addEntity(light);

	// cubeShader.material.shininess = 32;

	camera.far = 1000;

	console.log("SETUP DONE!");
	requestAnimationFrame(draw);
	setInterval(calculateFramerate, 1000);
	startupTime = Date.now() - startupTime;
	startupTime /= 1000;
	console.log(`STARTUP TOOK ${startupTime} SECONDS`)
	Loader.Free();
}

let dt = Date.now();
function draw()
{
	let delta = (Date.now() - dt);
	dt = Date.now();
	if (gl == undefined)
	{
		console.error("error: gl undefined");
		return;
	}
	// Do stuff that isnt  drawing
	light.transform.position.set(Math.sin(framecount / 60) * 20, 5, Math.cos(framecount / 60) * 20);

	framecount++;
	// Clear background
	SupersonicJS.clear(gl);
	scene.updateAllUniforms(gl);
	scene.draw(gl);


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
	} else
	{
		camera.speed = 1;
		camera.freecam(cameraMovementInput);
	}
	requestAnimationFrame(draw);

}

Loader.CacheImage("/images/test.png");
PBRShader.Register();
Flat3D.Register();
Loader.CacheHTTP("/Models/example.obj");
Loader.CacheHTTP("/Models/scene_test.obj");
Loader.LoadAll().then(setup);