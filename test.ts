import * as glmat from "gl-matrix";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable2D } from "./src/Renderables/Renderables";
import { FlatShader } from "./src/Shaders/FlatShader";
import { ImageShader } from "./src/Shaders/ImageShader";
import { Shader } from "./src/Shaders/Shader";
import * as utils from "./src/utilities";
import { Vector, Vector4 } from "./src/Transform/Vector";
import { SupersonicJS } from "./src/supersonic";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { SquareMesh } from "./src/Renderables/DefaultMeshes/square";
import { Scene } from "./src/EntityComponentSystem/Scene";
let rot = 0;
let then = 0;
let x = 0;

let square: GeometryRenderable2D;
let tri: GeometryRenderable2D;
let colouredShader: FlatShader;
let imageShader: ImageShader;
let scaleSlider: HTMLInputElement;
var Input: InputManager;
let wasd: InputAxis;
let scene : Scene;
let testObject : Entity;
let projectionMatrix : glmat.mat4;
let scale = 1;

let framecount = 0;

function draw(gl: WebGL2RenderingContext, now) {
	framecount++;
	now *= 0.001; //convert to seconds;
	let delta = now - then;
	then = now;
	rot += delta;
	x += delta;
	
	SupersonicJS.clear(gl);
	testObject.transform.rotation.z = -rot;
	testObject.transform.position.x = Math.sin(framecount/10)/2;
	colouredShader.colour.x = 0.5 + Math.sin(x) / 2;

	// square.transform.rotation.z = rot;
	square.transform.position.add(wasd.getAxis().div(10));
	square.transform.scale.set(0.5);

	scene.draw(gl);
	requestAnimationFrame(draw.bind(this, gl));
}

function main() {
	let gl = SupersonicJS.init("glCanvas", new Vector4(0, 0, 0, 1));
	scene = new Scene();


	Input = new InputManager();
	wasd = new InputAxis(Input, "d", "a", "w", "s");
	

	imageShader = ImageShader.create(gl, "/images/test32.png");
	colouredShader = FlatShader.create(gl);
	colouredShader.colour = new Vector4(1, 0.25, 0.125, 1);

	testObject = new Entity();

	square = new SupersonicJS.GeometryRenderable2D(
		gl,
		SquareMesh(),
		imageShader
	);
	
	tri = new GeometryRenderable2D(gl, [1, 1, -1, 1, 1, -1], colouredShader);
	
	projectionMatrix = utils.ProjectionMatrix.orthographic(
		gl,
		scale
	);

	function assignProjectionMatrices()
	{
		tri.projectionMatrix = projectionMatrix;
		square.projectionMatrix = projectionMatrix;
	}

	Input.addKeyListener("r", () => {
		projectionMatrix = utils.ProjectionMatrix.orthographic(
			gl,
			++scale
		)
		assignProjectionMatrices()
	})

	Input.addKeyListener("f", () => {
		projectionMatrix = utils.ProjectionMatrix.orthographic(
			gl,
			--scale
		)
		assignProjectionMatrices();
	})
		
	square.name = "SquareRenderable";
	tri.name = "TriangleRenderable";

	testObject.addComponent(square, gl);
	testObject.addComponent(tri, gl);
	scene.addEntity(testObject);

	square.transform.position.z = -6;
	tri.transform.position.z = -6;

	console.log(scene)

	requestAnimationFrame(draw.bind(this, gl));
}

main();
