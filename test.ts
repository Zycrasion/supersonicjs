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
import { FlatShader3D } from "./src/Shaders/3DFlatShader";

let scene : Scene;
let geometry : GeometryRenderable3D;

let framecount = 0;

console.log("just a reminder that if nothing is drawing it is because you forgot to put it infront of the camera.")

function draw(gl: WebGL2RenderingContext, now) {
	SupersonicJS.clear(gl);
	scene.draw(gl);
	requestAnimationFrame(draw.bind(this, gl));
	geometry.transform.rotation.x += 0.1;
	geometry.transform.rotation.y += 0.01;
}

function main() {
	let gl = SupersonicJS.init("glCanvas", new Vector4(0, 0, 0, 1));
	scene = new Scene();

	HTTP_REQUEST("/Models/example.obj").then(text => {
		let results = ObjParser.parse(text)
		console.log(results)
		let vertices : number[] = [];
		results.vertices.forEach(v=>{
			vertices.push(v.x,v.y,v.z);
		})

		let FlatCol = FlatShader3D.create(gl);
		FlatCol.colour = new Vector4(1,0,1,1)


		let ent = new Entity()
		geometry = new GeometryRenderable3D(
			gl,
			vertices,
			results.indices,
			FlatCol,
			utils.ProjectionMatrix.perspectiveDefault(gl)
 
		);
		ent.addComponent(
			geometry	
			,gl
		);
		
		scene.addEntity(ent);

		requestAnimationFrame(draw.bind(this, gl));
	})
}

main();
