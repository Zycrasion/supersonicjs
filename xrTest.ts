import { mat4 } from "gl-matrix";
import { CameraLike } from "./src/Camera";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { Controller, GamepadType } from "./src/InputManager/Controller";
import { Loader } from "./src/Loader/Loader";
import { ObjParser } from "./src/Parsers/ObjParser";
import { GeometryRenderable } from "./src/Renderables/Renderables";
import { Flat3D, Shaded3D } from "./src/Shaders/3DShader";
import { Transform } from "./src/Transform/Transform";
import { vec, vec4, Vector } from "./src/Transform/Vector";
import { XR } from "./src/XR/XR";
import { XRCamera } from "./src/XR/XRCamera";

Loader.CacheHTTP("/Models/monkey.obj");
Loader.CacheHTTP("/Models/example.obj");
Loader.CacheHTTP("/Models/scene_test.obj")

Shaded3D.Register();
Flat3D.Register();
Loader.LoadAll().then(() => {
    let xr = new XR();
    xr.xr_setup = setup;
    xr.init("immersive-vr");
})

document.body.innerHTML = "";

let scene : Scene;
let monkey : Entity;
let light : Entity;
let shaded : Shaded3D;
let flat : Flat3D;

let groundShader : Shaded3D;
let waterShader : Shaded3D;
let parent : Entity;


function setup(xr : XR, gl : WebGL2RenderingContext)
{
    parent = new Entity();
    // Monkey
    let monkeyData = ObjParser.parseOne(Loader.LoadHTTP("/Models/monkey.obj"));
    
    shaded = Shaded3D.create(gl);
    
    let monkeyMesh = new GeometryRenderable(gl, monkeyData, shaded);

    monkey = new Entity("MONKEY");
    monkey.addComponent(monkeyMesh, gl);
    monkey.transform.position.set(0,0,-2);
    monkeyMesh.transform.scale.set(0.1);
    monkeyMesh.transform.rotation.x = -Math.PI/2;

    // Light
    let lightData = ObjParser.parseOne(Loader.LoadHTTP("/Models/example.obj"));

    flat = Flat3D.create(gl);

    let lightMesh = new GeometryRenderable(gl, lightData, flat);

    light = new Entity("Light");
    light.addComponent(lightMesh, gl);

    light.transform.position.set(2,2,2)
    lightMesh.transform.scale.set(0.1);

    // Scene
    scene = new Scene();
    scene.addEntity(monkey)
    scene.addEntity(light);

    // Shaders
    flat.setColour(vec4(1,1,1,1));


    shaded.material.setColour(vec(1,0,0.25));
    shaded.material.ambient.setVec(shaded.material.diffuse.div(10));
    shaded.light.setColour(flat.getColour().toVector3());
    shaded.light.position = light.transform.position;

    
    // World

    let sceneMeshes = ObjParser.parseAll(Loader.LoadHTTP("/Models/scene_test.obj"));

    groundShader = Shaded3D.create(gl);
	groundShader.material.ambient = vec(29, 79, 17).div(255);
	groundShader.material.diffuse = vec(27, 135, 1).div(255);
	groundShader.material.specular = vec(255, 255, 255).div(255);

	waterShader = Shaded3D.create(gl);
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
	groundShader.light.setColour(vec(1,1,1));
	waterShader.light = groundShader.light;

 

    // XR
    xr.xr_draw = draw;

    offset = new Vector();
}

let offset : Vector;
function draw(xr : XR, gl : WebGL2RenderingContext, camera : CameraLike)
{
    shaded.viewPos = camera.getPosition().toVector3();


    if (xr.inputSources.length >= 2 )
    {
        let one = xr.inputSources[0];
        let two = xr.inputSources[1];

        let leftInput : XRInputSource;
        let rightInput : XRInputSource;

        if (one.handedness == "right")
        {
            rightInput = one;
            leftInput = two;
        } else {            
            rightInput = two;
            leftInput = one;
        }


        light.transform = xr.getControllerTransform(rightInput);
        light.transform.position.sub(offset);


        monkey.transform = xr.getControllerTransform(leftInput);
        monkey.transform.position.sub(offset);

        if (leftInput.gamepad.axes.length >= 4)
        {
            let movement = camera.getLookAt.mult(leftInput.gamepad.axes[3]);
            offset.add(movement.div(10).mult(-1))
        }

        let lightMatrix = mat4.create();
        mat4.translate(lightMatrix, lightMatrix, offset.copy().mult(-1).toFloat32Array());
        mat4.multiply(lightMatrix,lightMatrix,light.transform.overrideMatrix);
        light.transform.overrideMatrix = lightMatrix;

        let monkeyMatrix = mat4.create();
        mat4.translate(monkeyMatrix, monkeyMatrix, offset.copy().mult(-1).toFloat32Array());
        mat4.multiply(monkeyMatrix,monkeyMatrix,monkey.transform.overrideMatrix);
        monkey.transform.overrideMatrix = monkeyMatrix;



    }

    groundShader.light.position = light.transform.position;
    waterShader.light.position = light.transform.position;
    shaded.light.position = light.transform.position;

    groundShader.viewPos = camera.getPosition();
    waterShader.viewPos = camera.getPosition();

    shaded.updateUniforms(gl);
    flat.updateUniforms(gl);
    groundShader.updateUniforms(gl);
    waterShader.updateUniforms(gl);

    
    let last = camera.transformationMatrix;
    mat4.translate(last,last,offset.toFloat32Array());
    

    scene.MainCamera = camera;
    scene.draw(gl);
}