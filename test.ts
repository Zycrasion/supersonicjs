import * as glmat from "gl-matrix";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable2D, GeometryRenderable3D } from "./src/Renderables/Renderables";
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
import { ObjParser } from "./src/Parsers/ObjParser";
import { FlatShader3D, Shaded3D } from "./src/Shaders/3DShader";
import { Transform } from "./src/Transform/Transform";
import { off } from "process";
import { Camera } from "./src/Camera";

let scene : Scene;
let cubeCol = new Vector4(0.5,0,0.25,1);
let lightCol = new Vector4(1,0.5,1,1);

let cube : GeometryRenderable3D;
let light : GeometryRenderable3D;
let ent = new Entity();
let CubeShader : Shaded3D;
let inputman : InputManager;
let wasd : InputAxis;
let transforms : Transform[];

let avgFps = 0;
let framerateCalcs = 0;
let framecount = 0;
let lastFrameCount = 0;
let lastDate = Date.now();
function calculateFramerate()
{
	let difference = framecount-lastFrameCount;
	let fps = difference/(Date.now()-lastDate)*1000;

	avgFps += fps;
	framerateCalcs += 1;
	console.log("FPS:", avgFps/framerateCalcs);

	lastDate = Date.now();
	lastFrameCount = framecount;
}

setInterval(calculateFramerate,1000)

let camera = new Camera();
camera.hook_FreeLook();
console.log("just a reminder that if nothing is drawing it is because you forgot to put it infront of the camera.")
camera.setFov(90)


function draw(gl: WebGL2RenderingContext) {
	SupersonicJS.clear(gl);
	framecount += 1;
	camera.freecam(wasd);

	


	light.draw_tick(gl, camera ,() => {
		light.shader.setShaderUniform_4fv(gl,"uColour", lightCol)
		light.shader.setShaderUniform_mat4fv(gl,"CameraMatrix", camera.getTransformation())
	})


	cube.transform.position.set(0,0,0)
	CubeShader.LightPosition = light.transform.position;
	CubeShader.Colour = cubeCol.toVector3();
	CubeShader.LightColour = lightCol.toVector3();
	CubeShader.viewPos = camera.transform.position;
	
	CubeShader.use(gl,() => {CubeShader.setShaderUniform_mat4fv(gl,"CameraMatrix", camera.getTransformation())});
	for (let i=0;i<transforms.length;i++)
	{
		cube.transform = transforms[i];
		// cube.transform.rotation.add(Math.sin(framecount)/10);
		
		cube.draw_tick(gl, camera)
	}

	
	requestAnimationFrame(draw.bind(this, gl));
}






function main() {


	// tests
	let a = new Vector(1,1,1);
	console.log(a.getMagnitude())
	a.normalize();
	console.log(a);
	console.log(a.getMagnitude())


	let gl = SupersonicJS.init("glCanvas", new Vector4(0.1, 0.1, 0.1, 1));
	scene = new Scene();
	transforms = [];
	let scale = 10;
	for (let i=0;i<100;i++)
	{
		let t = new Transform();
		t.position.set((Math.random()*scale*2)-scale,(Math.random()*scale*2)-scale,(Math.random()*scale*2)-scale);
		t.rotation.set(Math.random()*10,Math.random()*10,Math.random()*10);
		t.scale.set(Math.random())
		transforms.push(t);
	}

	inputman = new InputManager();
	wasd = new InputAxis(inputman, "d" , "a", "w", "s");
	inputman.addKeyListener("q", () => {
		camera.transform.position.y += 0.1;
	})
	inputman.addKeyListener("e", () => {
		camera.transform.position.y -= 0.1;
	})

	

	HTTP_REQUEST("/Models/example.obj").then(text => {
		let results = ObjParser.parse(text)
		let vertices : number[] = [];
		console.log(results.normals)
		results.vertices.forEach(v=>{
			vertices.push(v.x,v.y,v.z);
		})

		let normals : number[] = [];
		results.normals.forEach(v => {
			normals.push(v.x,v.y,v.z);
		})

		CubeShader = Shaded3D.create(gl);
		CubeShader.Colour = new Vector4(1,1,1,1)

		cube = new GeometryRenderable3D(
			gl,
			vertices,
			results.indices,
			results.normals,
			results.textures,
			CubeShader,
			utils.ProjectionMatrix.perspectiveDefault(gl)
 
		);

		light = new GeometryRenderable3D(
			gl,
			vertices,
			results.indices,
			results.normals,
			results.textures,
			FlatShader3D.create(gl),
			utils.ProjectionMatrix.perspectiveDefault(gl)
		)

		ent.addComponent(
			cube	
			,gl
		);

		ent.addComponent(
			light,
			gl
		)
		
		scene.addEntity(ent);

		requestAnimationFrame(draw.bind(this, gl));
	})
}

main();