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

let scene : Scene;
let geometry : GeometryRenderable3D;
let rot = 0;
let cubeCol = new Vector4(0.5,0,0.25,1);
let lightCol = new Vector4(1,0.5,1,1);

let cube : GeometryRenderable3D;
let light : GeometryRenderable3D;
let ent = new Entity();
let CubeShader : Shaded3D;

let framecount = 0;

console.log("just a reminder that if nothing is drawing it is because you forgot to put it infront of the camera.")

 
function draw(gl: WebGL2RenderingContext, now) {
	SupersonicJS.clear(gl);
	framecount += 0.01;
	// lightCol.x = 0.5 + Math.sin(framecount+=0.01)/2;
	// lightCol.y = 1-lightCol.x;
	
	let proj = utils.ProjectionMatrix.perspectiveDefault(gl);
	let transform = new Transform();
	transform.rotation.y = framecount;
	transform.rotation.z = framecount*2;
	glmat.mat4.multiply(proj,proj,transform.generateMat4());

	cube.projectionMatrix = proj

	light.projectionMatrix = proj
	
	light.transform.position.set(0,0,0);
	light.transform.scale.set(0.5)
	light.transform.position.y = Math.sin(framecount)*3
	light.transform.position.x = Math.cos(framecount)*3
	light.draw_tick(gl,() => {
		light.shader.setShaderUniform_4fv(gl,"uColour",lightCol)
	})


	cube.transform.position.set(0,0,0)
	// cube.transform.rotation.set(Math.cos(framecount*2))
	// Very hacky i know
	CubeShader.LightPosition = light.transform.position;
	CubeShader.Colour = cubeCol.toVector3();
	CubeShader.LightColour = lightCol.toVector3();
	cube.draw_tick(gl)
	
	requestAnimationFrame(draw.bind(this, gl));
}

function main() {
	let gl = SupersonicJS.init("glCanvas", new Vector4(0.1, 0.1, 0.1, 1));
	scene = new Scene();

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
		CubeShader.Colour = new Vector4(0.25,0.5,1,1)

		cube = new GeometryRenderable3D(
			gl,
			vertices,
			results.indices,
			results.normals,
			results.normalIndices,
			CubeShader,
			utils.ProjectionMatrix.perspectiveDefault(gl)
 
		);

		light = new GeometryRenderable3D(
			gl,
			vertices,
			results.indices,
			results.normals,
			results.normalIndices,
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
