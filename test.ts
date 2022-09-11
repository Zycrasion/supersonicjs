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

let scene : Scene;
let geometry : GeometryRenderable3D;
let rot = 0;
let cubeCol = new Vector4(0.5,0,0.25,1);
let lightCol = new Vector4(1,0.5,1,1);

let cube : GeometryRenderable3D;
let light : GeometryRenderable3D;
let ent = new Entity();
let CubeShader : Shaded3D;
let CameraTransform : Transform;
let inputman : InputManager;
let wasd : InputAxis;
let framecount = 0;
let mouseX : number = 0;
let mouseY : number = 0;
let startX = mouseX, startY = mouseY;
let down = false;
let transforms : Transform[];
console.log("just a reminder that if nothing is drawing it is because you forgot to put it infront of the camera.")

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
	var eventDoc, doc, body;

	event = event || window.event as MouseEvent; // IE-ism

	// If pageX/Y aren't available and clientX/Y are,
	// calculate pageX/Y - logic taken from jQuery.
	// (This is to support old IE)
	if (event.pageX == null && event.clientX != null) {
		eventDoc = (event.target && event.target.ownerDocument) || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;

		event.pageX = event.clientX +
		  (doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
		  (doc && doc.clientLeft || body && body.clientLeft || 0 );
		event.pageY = event.clientY +
		  (doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
		  (doc && doc.clientTop  || body && body.clientTop  || 0 );
	}

	mouseX = event.pageX + 500;
	mouseY = event.pageY + 500;
}
document.onmousedown = mouseDown; 
function mouseDown(event : MouseEvent)
{
	startX = mouseX;
	startY = mouseY;
	down = true;
}
document.onmouseup = mouseUp;
function mouseUp(event : MouseEvent)
{
	down = false;
}
let proj;
function draw(gl: WebGL2RenderingContext, now) {
	SupersonicJS.clear(gl);
	framecount += 0.01;

	

	let axis = wasd.getAxis().div(10);

	let dir = new Vector();
	dir.z = -Math.cos( CameraTransform.rotation.y - (Math.PI)) * axis.y;
	dir.x = Math.sin( CameraTransform.rotation.y - (Math.PI)) * axis.y;

	
	CameraTransform.position.add(dir)
	if (down)
	{
		CameraTransform.rotation.y += (startX-mouseX)/500;
		startX = mouseX;
		CameraTransform.rotation.x += (startY-mouseY)/500;
		startY = mouseY;
	}

	
	cube.projectionMatrix = proj
	
	light.projectionMatrix = proj
	



	light.draw_tick(gl,() => {
		light.shader.setShaderUniform_4fv(gl,"uColour", lightCol)
		light.shader.setShaderUniform_mat4fv(gl,"CameraMatrix", CameraTransform.generateMat4())
	})


	cube.transform.position.set(0,0,0)
	CubeShader.LightPosition = light.transform.position;
	CubeShader.Colour = cubeCol.toVector3();
	CubeShader.LightColour = lightCol.toVector3();
	CubeShader.viewPos = CameraTransform.position;
	
	CubeShader.use(gl,() => {CubeShader.setShaderUniform_mat4fv(gl,"CameraMatrix", CameraTransform.generateMat4())});
	for (let i=0;i<transforms.length;i++)
	{
		cube.transform = transforms[i];
		cube.transform.rotation.add(Math.random()*0.1);
		
		cube.draw_tick(gl)
	}

	
	requestAnimationFrame(draw.bind(this, gl));
}

function main() {
	let gl = SupersonicJS.init("glCanvas", new Vector4(0.1, 0.1, 0.1, 1));
	proj = utils.ProjectionMatrix.perspectiveDefault(gl);
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

	CameraTransform = new Transform();
	inputman = new InputManager();
	wasd = new InputAxis(inputman, "d" , "a", "w", "s");
	inputman.addKeyListener("q", () => {
		CameraTransform.position.y += 0.1;
	})
	inputman.addKeyListener("e", () => {
		CameraTransform.position.y -= 0.1;
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
