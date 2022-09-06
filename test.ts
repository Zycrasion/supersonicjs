import * as glmat from "gl-matrix"
import { InputAxis, InputManager } from "./src/InputManager/Input";
import { GeometryRenderable2D } from "./src/Renderables";
import { FlatShader } from "./src/Shaders/FlatShader";
import { ImageShader } from "./src/Shaders/ImageShader";
import { Shader } from "./src/Shaders/Shader";
import * as utils from "./src/utilities"
import { Vector, Vector4 } from "./src/Vector";
import { SupersonicJS } from "./src/supersonic"
import { HTTP_REQUEST } from "./src/Request/httpRequest";
let rot = 0;
let then = 0;
let x= 0;

let square : GeometryRenderable2D;
let tri : GeometryRenderable2D;
let colouredShader : FlatShader;
let imageShader  : ImageShader;
let scaleSlider : HTMLInputElement;
var Input : InputManager;
let wasd : InputAxis;

function draw(gl : WebGLRenderingContext ,now)
{

    now *= 0.001 //convert to seconds;
    let delta = now - then;
    then = now;



   SupersonicJS.clear(gl);
    

    let projectionMatrix = utils.ProjectionMatrix.orthographic(gl,parseInt(scaleSlider.value,10));


    rot += delta;
    x += delta;

    colouredShader.colour.x = 0.5+(Math.sin(x)/2);


    // square.transform.rotation.z = rot;
    square.transform.position.add(wasd.getAxis().div(10));
    square.transform.scale.set(0.5);
    square.draw(gl, projectionMatrix);

    tri.transform.rotation.z = -rot;
    tri.transform.scale.set(-Math.abs(Math.sin(x)));
    tri.draw(gl, projectionMatrix);

    requestAnimationFrame(draw.bind(this,gl));
}

function main()
{
    let gl = SupersonicJS.init("glCanvas", new Vector4(0,0,0,1));

    Input = new InputManager();
    wasd = new InputAxis(
        Input,
        "d",
        "a",
        "w",
        "s"
    )

    imageShader = ImageShader.create(gl, "/images/test32.png");
    

    square = new SupersonicJS.GeometryRenderable2D(gl, [
        1,1,
        -1,1,
        1,-1,
        -1,-1
    ],imageShader);

    colouredShader = FlatShader.create(gl);
    colouredShader.colour = new Vector4(1,0.25,0.125,1);

    tri = new GeometryRenderable2D(gl, [
        1,1,
        -1,1,
        1,-1
    ],colouredShader);

    scaleSlider = document.createElement("input") as HTMLInputElement;
    scaleSlider.type = "range";
    scaleSlider.min = "1";
    scaleSlider.max = "100";
    scaleSlider.value = "1";
    document.body.appendChild(scaleSlider);

    square.transform.position.z = -6;
    tri.transform.position.z = -6;

    requestAnimationFrame(draw.bind(this,gl))

}

main();