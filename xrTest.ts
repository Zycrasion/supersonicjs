import { CameraLike, ProjectionType } from "./src/Camera";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { Loader } from "./src/Loader/Loader";
import { ObjParser } from "./src/Parsers/ObjParser";
import { GeometryRenderable3D } from "./src/Renderables/Renderables";
import { HTTP_REQUEST } from "./src/Request/httpRequest";
import { Flat3D, Shaded3D } from "./src/Shaders/3DShader";
import { SupersonicJS } from "./src/supersonic";
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
    monkey.transform.position.set(0,0,-2)

    // Light
    let lightData = ObjParser.parseOne(Loader.LoadHTTP("/Models/example.obj"));

    flat = Flat3D.create(gl);

    let lightMesh = new GeometryRenderable3D(gl, lightData, flat);

    light = new Entity("Light");
    light.addComponent(lightMesh, gl);

    light.transform.position.set(2,2,2)

    // Scene
    scene = new Scene();
    scene.addEntity(monkey)
    scene.addEntity(light);

    // Shaders
    shaded.material.setColour(vec(1,0,0.25));
    shaded.light.setColour(vec(1,1,1));
    shaded.light.position = light.transform.position;

    flat.setColour(vec4(1,1,1,1));
    
    // XR
    xr.xr_draw = draw;
}

function draw(xr : XR, gl : WebGL2RenderingContext, camera : XRCamera, frame : XRFrame)
{
    shaded.viewPos = camera.getPosition().toVector3();
    shaded.updateUniforms(gl);
    flat.updateUniforms(gl);

    for (let input of xr.inputSources)
    {
        light.transform.overrideMatrix = frame.getPose(input.gripSpace, xr.referenceSpace).transform.matrix;
        console.log(light.transform.overrideMatrix)
    }

    scene.MainCamera = camera;
    scene.draw(gl);
}