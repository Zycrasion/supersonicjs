import { SoundPlayer } from "./src/Audio/SoundPlayer";
import { Camera, ProjectionType } from "./src/Camera";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { Loader } from "./src/Loader/Loader"
import { MeshData, ObjParser } from "./src/Parsers/ObjParser";
import { SquareMesh } from "./src/Renderables/DefaultMeshes/square";
import { GeometryRenderable } from "./src/Renderables/Renderables";
import { Texture } from "./src/Renderables/Texture";
import { DepthShader } from "./src/Shaders/DepthShader";
import { Light } from "./src/Shaders/LightSource";
import { PBRMaterial, PBRShader } from "./src/Shaders/PBR";
import { sonic } from "./src/supersonic";
import { vec, vec4 } from "./src/Transform/Vector";
import { PointerLock } from "./src/utilities";

const loadHTTP = {
	scene: "/Models/testing\ scene.obj",
}

const loadImage = {
	scene_tex: "/images/testing.png"
}

for (let httpRequest of Object.values(loadHTTP))
{
	Loader.CacheHTTP(httpRequest);
}

for (let imageRequest of Object.values(loadImage))
{
	Loader.CacheImage(imageRequest);
}

PBRShader.Register();

Loader.LoadAll().then(setup);

const gl = sonic.init("glCanvas",vec4(0.1,0.1,0.1,1));
const MainScene = new Scene(
	gl,
	{
		shadowsEnabled : true,
	}
);


const cam = new Camera(ProjectionType.PERSPECTIVE);
const wasd = new InputAxis(new InputManager(), "d" , "a", "w", "s");


let quad : MeshData = SquareMesh(1,1);

async function setup()
{
	console.log("I EXIST???");
	let ext = gl.getExtension("EXT_color_buffer_float");
	if (!ext)
	{
		alert("need extension");
		return
	}
	let sceneMesh = new GeometryRenderable(
		gl, ObjParser.parseOne(Loader.LoadHTTP(loadHTTP.scene)),
		PBRShader.create(gl)
	)

	let SceneMaterial = new PBRMaterial();
	SceneMaterial.diffuse = await Texture.load(gl, loadImage.scene_tex, gl.NEAREST);
	// SceneMaterial.diffuse = MainScene.shadowFBO;
	SceneMaterial.specular = SceneMaterial.diffuse;
	
	let light = new Light(
		vec(10,10,10),
		vec(0,4,0)
	);


	light.setColour(vec(1,1,1));

	MainScene.addEntity(
		sceneMesh.with_Entity(SceneMaterial)
	)

	MainScene.light = light;

	PointerLock.Lock("glCanvas");
	cam.hook_freelook();
	cam.speed = 1;

	MainScene.MainCamera = cam;


	let quadMesh = new GeometryRenderable(
		gl,
		quad,
		PBRShader.create(gl)
	)

	let mat = new PBRMaterial();
	mat.diffuse = SceneMaterial.diffuse;
	mat.specular = mat.diffuse;

	let e = quadMesh.with_Entity(mat);

	e.transform.position.z = 11;
	e.transform.scale.set(5);

	MainScene.addEntity(e)

	let soundTest = new SoundPlayer();
	await soundTest.loadAUDIO("AudioTest/test.wav");
	// soundTest.play(); // annoying sound everytime you reload
	MainScene.addEntity(soundTest.toEntity());

	Loader.Free();
	requestAnimationFrame(draw);
}

function draw()
{

	cam.freecam(wasd);
	MainScene.draw(gl);
	requestAnimationFrame(draw);
}
