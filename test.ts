import { FollowPosition, Rotating, SpeedColourChange } from "./component_test";
import { Camera } from "./src/Camera";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { Loader } from "./src/Loader/Loader";
import { ObjParser } from "./src/Parsers/ObjParser";
import { GeometryRenderable } from "./src/Renderables/Renderables";
import { Texture } from "./src/Renderables/Texture";
import { Shaded3D } from "./src/Shaders/3DShader";
import { Light } from "./src/Shaders/LightSource";
import { Material } from "./src/Shaders/Material";
import { PBRMaterial, PBRShader } from "./src/Shaders/PBR";
import { sonic } from "./src/supersonic";
import { vec, vec4 } from "./src/Transform/Vector";
import { PointerLock } from "./src/utilities";

const cubeHTTP = "/Models/example.obj";

const container_diffuse = "/images/container_diffuse.png";
const container_specular = "/images/container_specular.png";

Loader.CacheHTTP(cubeHTTP);

Loader.LoadImage(container_diffuse);
Loader.LoadImage(container_specular);

PBRShader.Register();
Shaded3D.Register();

Loader.LoadAll().then(setup)

const gl = sonic.init("glCanvas", vec4(0.1,0.1,0.1,1), {alpha: false})

var PBR : PBRShader;
var Shaded : Shaded3D;

let containerMaterial : PBRMaterial;

const scene = new Scene();
let camera = new Camera();
const light = new Light();

const wasd = new InputAxis(new InputManager(), "a", "d", "w", "s");

var framecount = 0;

async function setup()
{

	PointerLock.Lock("glCanvas");

	let cubeMeshData = ObjParser.parseOne(Loader.LoadHTTP(cubeHTTP));

	PBR = PBRShader.create(gl);
	Shaded = Shaded3D.create(gl);

	let cubeMeshPBR = new GeometryRenderable(
		gl,
		cubeMeshData,
		PBR
	);

	let cubeMeshShaded = new GeometryRenderable(
		gl,
		cubeMeshData,
		Shaded
	)

	let container = new Entity();

	containerMaterial = new PBRMaterial();
	containerMaterial.diffuse = await Texture.load(gl, container_diffuse);
	containerMaterial.specular = await Texture.load(gl, container_specular);

	container.addComponent(
		cubeMeshPBR.with(containerMaterial)
	)
	container.addComponent(
		new FollowPosition(
			light.position
		)
	)

	scene.addEntity(container);

	light.ambient.set(.1);
	light.diffuse.set(.5);
	light.specular.set(1);
	light.position.set(Math.sin(framecount/100) * 5, 0, Math.cos(framecount/100) * 5)

	
	scene.light = light;

	let lightMaterial : Material = new Material();
	lightMaterial.ambient = light.ambient;
	lightMaterial.diffuse = light.diffuse;
	lightMaterial.specular = light.specular;

	let lightObject = new Entity();

	lightObject.addComponent(
		cubeMeshShaded.with(lightMaterial)
	);

	let _ = new FollowPosition(container.transform.position)
	.setMag(
		750
	);

	lightObject.addComponent(
		_	
	).addComponent(
		new SpeedColourChange(_.vel, lightMaterial)
	)

	scene.addEntity(lightObject);

	scene.addEntity(
		new Entity()
		.addComponent(
			cubeMeshPBR.with(containerMaterial)
		)
		.addComponent(
			new FollowPosition(lightObject.transform.position)
			.setMag(250)
		)
	)

	camera.hook_freelook();

	camera.far = 1000;
	scene.MainCamera = camera;



	requestAnimationFrame(draw)
}

function draw()
{
	framecount++;
	light.position.set(Math.sin(framecount/100) * 5, 0, Math.cos(framecount/100) * 5)
	
	sonic.clear(gl);
	camera.freecam(wasd);
	scene.updateAllUniforms(gl);
	scene.draw(gl);
	requestAnimationFrame(draw);
}