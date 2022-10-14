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
import { Scene } from "./src/EntityComponentSystem/Scene";
import { XBOX_ANALOG_RAW, XBOX_ANALOG_INPUTS, XBOX_DIGITAL_INPUTS } from "./src/InputManager/mappings/xbox_mappings";
import { ITexture, Texture } from "./src/Renderables/Texture";
import { FrameTexture } from "./src/Renderables/FrameTextures";
import { Font } from "./src/Renderables/Font";
import { font8x8 } from "./font-8x8";

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

let container: GeometryRenderable;

let groundShader : Shaded3D;

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
	let cubeText = await HTTP_REQUEST("/Models/example.obj");
	console.log("CUBE DOWNLOADED")
	// Parse raw text to get MeshData
	let sceneMeshes = ObjParser.parseAll(sceneText);
	console.log("SCENE PARSED");
	let cubeMesh = ObjParser.parseOne(cubeText);
	console.log("LIGHT PARSED")
	console.log(cubeMesh);

	camera = new Camera(ProjectionType.PERSPECTIVE, 90, vec(-2, -2, -2))

	groundShader = Shaded3D.create(gl);
	groundShader.material.ambient = vec(29, 79, 17).div(255);
	groundShader.material.diffuse = vec(27, 135, 1).div(255);
	groundShader.material.specular = vec(255, 255, 255).div(255);

	let waterShader = Shaded3D.create(gl);
	waterShader.material.ambient = vec(7, 31, 66).div(255);
	waterShader.material.diffuse = vec(1, 99, 135).div(255);
	waterShader.material.specular = vec(255, 255, 255).div(255);

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
			cubeMesh,
			lightShader
		),
		gl
	);

	groundShader.light.setColour(vec(1, 1, 1));
	groundShader.light.ambient = vec(1, 1, 1);
	groundShader.light.diffuse = vec(0.5, 0.5, 0.5);
	waterShader.light = groundShader.light;

	groundShader.light.position = camera.transform.position;

	pcDiffuse = Shaded3D.create(gl);
	pcDiffuse.light = groundShader.light;
	pcDiffuse.material.ambient.set(0.1);
	pcDiffuse.material.diffuse.set(0.5);
	pcDiffuse.material.specular.set(1);

	pcPBR = PBRShader.create(gl);
	pcPBR.light = groundShader.light;
	pcPBR.material.diffuse = screen = FrameTexture.create(gl, gl.canvas.width, gl.canvas.height);
	pcPBR.material.specular = pcPBR.material.diffuse;

	pc = new Entity();
	let pcMesh = ObjParser.parseAll(await HTTP_REQUEST("/Models/pc.obj"));
	for (let mesh of pcMesh)
	{
		let split = mesh.name.split("_");
		if (split[split.length - 1] == "screen")
		{
			pc.addComponent(
				new GeometryRenderable(
					gl,
					mesh,
					pcPBR
				),
				gl
			)
		} else 
		{
			pc.addComponent(
				new GeometryRenderable(
					gl,
					mesh,
					pcDiffuse
				),
				gl
			)
		}
	}

	screenCam = new Camera(ProjectionType.ORTHOGRAPHIC);
	screenCam.transform.position.z = -3;

	console.log("LIGHT INITIALISED")
	scene.addEntity(light);

	// cubeShader.material.shininess = 32;

	camera.far = 1000;

	


	font = new Font(font8x8);
	font.texture = await Texture.load(gl, "/images/8x8-font.png")
	let data = font.createText("supersonicjs is cool");
	console.log(data);
	let flat = PBRShader.create(gl);
	flat.light = groundShader.light;
	flat.material.specular = font.texture;
	flat.material.diffuse = font.texture;
	flat.updateUniforms(gl);
	text = new GeometryRenderable(gl, data, flat);
	text.transform.scale.set(0.05);
	requestAnimationFrame(draw);
}

let pc: Entity, pcDiffuse: Shaded3D, pcPBR: PBRShader, screen: FrameTexture, screenCam: Camera;
let dt = Date.now();
let mouseOn = true;
let keyDownLastFrame = false;
let font: Font, text: GeometryRenderable;
function draw()
{
	let delta = (Date.now() - dt);
	dt = Date.now();
	if (gl == undefined)
	{
		console.error("error: gl undefined");
		return;
	}
	
	groundShader.light.position = light.transform.position;

	// pcScreen

	screen.bindFrameBuffer(gl);
	let _ = SupersonicJS.clearColour;
	SupersonicJS.setClearColour(gl, vec4(0, 0.1, 0));
	SupersonicJS.clear(gl);
	text.draw_tick(gl, screenCam);
	SupersonicJS.setClearColour(gl, _);
	screen.unbindFrameBuffer(gl);

	// Back to scene


	// Do stuff that isnt  drawing
	light.transform.position.set(Math.sin(framecount / 60) * 4, 7, Math.cos(framecount / 60) * 4);
	framecount++;
	// Clear background
	SupersonicJS.clear(gl);
	scene.updateAllUniforms(gl);
	pcDiffuse.updateUniforms(gl);
	pc.draw_tick(gl, camera);
	scene.draw(gl);

	if (inputManager.getKey("F").isPressed)
	{
		if (!keyDownLastFrame)
		{
			mouseOn = !mouseOn;
			if (mouseOn)
			{
				camera.hook_freelook();
			} else
			{
				camera.unhook_freelook();
			}
		}
		keyDownLastFrame = true;
	} else
	{
		keyDownLastFrame = false;
	}


	// Move Camera
	if (inputManager.mainController != "NONE")
	{
		let controller = inputManager.controllers[inputManager.mainController];

		if (controller.getButton(XBOX_DIGITAL_INPUTS.RIGHT_BUMPER).pressed)
		{
			camera.speed = 16
		} else
		{
			camera.speed = 8;
		}

		let dpad = controller.getAnalogStick(XBOX_ANALOG_INPUTS.DPAD);

		let zoom = (controller.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_TRIGGER) + 1) / 2;
		camera.fov = 90 - (45 * (zoom))
		console.log(controller.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_TRIGGER));

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
Loader.CacheHTTP("/Models/pc.obj");

Loader.CacheImage("/images/container_specular.png");
Loader.CacheImage("/images/container_diffuse.png");

Loader.LoadAll().then(setup);