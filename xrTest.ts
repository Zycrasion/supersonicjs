import { Entity } from "./src/EntityComponentSystem/Entity";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { Loader } from "./src/Loader/Loader";
import { ObjParser } from "./src/Parsers/ObjParser";
import { GeometryRenderable3D } from "./src/Renderables/Renderables";
import { Flat3D, Shaded3D } from "./src/Shaders/3DShader";
import { Transform } from "./src/Transform/Transform";
import { vec, vec4 } from "./src/Transform/Vector";
import { XR } from "./src/XR/XR";
import { XRCamera } from "./src/XR/XRCamera";

Loader.CacheHTTP("/Models/monkey.obj");
Loader.CacheHTTP("/Models/example.obj");

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

function setup(xr : XR, gl : WebGL2RenderingContext)
{
    // Monkey
    let monkeyData = ObjParser.parseOne(Loader.LoadHTTP("/Models/monkey.obj"));
    
    shaded = Shaded3D.create(gl);
    
    let monkeyMesh = new GeometryRenderable3D(gl, monkeyData, shaded);

    monkey = new Entity("MONKEY");
    monkey.addComponent(monkeyMesh, gl);
    monkey.transform.position.set(0,0,-2);
    monkeyMesh.transform.scale.set(0.1);
    monkeyMesh.transform.rotation.x = -Math.PI/2;

    // Light
    let lightData = ObjParser.parseOne(Loader.LoadHTTP("/Models/example.obj"));

    flat = Flat3D.create(gl);

    let lightMesh = new GeometryRenderable3D(gl, lightData, flat);

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

    
    // XR
    xr.xr_draw = draw;
}

function draw(xr : XR, gl : WebGL2RenderingContext, camera : XRCamera, frame : XRFrame)
{
    shaded.viewPos = camera.getPosition().toVector3();


    if (xr.inputSources.length >= 2)
    {
        let one = xr.inputSources[0];
        let two = xr.inputSources[1];

        let leftInput : XRInputSource;
        let rightInput : XRInputSource;

        let left : Transform;
        let right : Transform;

        if (one.handedness == "right")
        {
            rightInput = one;
            leftInput = two;
        } else {            
            rightInput = two;
            leftInput = one;
        }

        let grip = frame.getPose(rightInput.gripSpace, xr.referenceSpace);
        right = monkey.transform;
        right.position = vec().setVec(grip.transform.position);
        right.overrideMatrix = grip.transform.matrix;

        grip = frame.getPose(leftInput.gripSpace, xr.referenceSpace);
        left = light.transform;
        left.position = vec().setVec(grip.transform.position);
        left.overrideMatrix = grip.transform.matrix

        light.transform = right;
        monkey.transform = left;
    }

    shaded.light.position = light.transform.position;

    shaded.updateUniforms(gl);
    flat.updateUniforms(gl);

    scene.MainCamera = camera;
    scene.draw(gl);
}