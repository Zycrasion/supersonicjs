# SupersonicJS
Status: Beta v0.3.7

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
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable3D } from "./src/Renderables/Renderables";
import * as utils from "./src/utilities";
import { vec, vec4 } from "./src/Transform/Vector";
import { SupersonicJS } from "./src/supersonic";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { ObjParser } from "./src/Parsers/ObjParser";
import { Shaded3D, Flat3D } from "./src/Shaders/3DShader";
import { Camera, ProjectionType } from "./src/Camera";
import { Light } from "./src/Shaders/LightSource";

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
		cubeShader.material.setColour(vec(1,0,1));
        cubeShader.material.shiny = 32;
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

        // Create Light and initialise shaders
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

        // Configure Materials
		cubeShader.material.setColour(vec(1,0.25,1))
		cubeShader.light = new Light();
		cubeShader.light.setColour(vec().set(0.25));
        
        // Configure Material/Light Positional properties
		cubeShader.light.position = light.transform.position;
		cubeShader.viewPos = camera.transform.position;

		// Call draw on frame update
		requestAnimationFrame(draw.bind(this))
	})
}

let framecount = 0;
function draw()
{

	// Do stuff that isnt  drawing
	light.transform.position.set(Math.sin(framecount / 60)*4,0,Math.cos(framecount / 60)*4);

    // bump framecount
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
```

## Debugging Resources
- https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants

## Known Bugs
- Sometimes the light wont draw due to only supplying 4 vertices?