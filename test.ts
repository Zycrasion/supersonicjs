import * as glmat from "gl-matrix"
import { GeometryRenderable2D } from "./src/Renderables";
import { FlatShader } from "./src/Shaders/FlatShader";
import { ImageShader } from "./src/Shaders/ImageShader";
import { Shader } from "./src/Shaders/Shader";
import * as utils from "./src/utilities"
let rot = 0;
let then = 0;
let x= 0;

let square : GeometryRenderable2D;
let tri : GeometryRenderable2D;
let colouredShader : FlatShader;
let imageShader  : ImageShader;

function draw(gl : WebGLRenderingContext ,now)
{

    now *= 0.001 //convert to seconds;
    let delta = now - then;
    then = now;

    gl.clearColor(0,0,0,1);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
    

    let projectionMatrix = utils.ProjectionMatrix.orthographic(gl);

    rot += delta;
    x += delta;

    colouredShader.colour.x = 0.5+(Math.sin(x)/2);


    // square.transform.rotation.z = rot;
    // square.transform.position.x = Math.sin(x*2)/2;
    square.transform.scale.set(0.5);
    square.draw(gl, projectionMatrix);

    tri.transform.rotation.z = -rot;
    tri.transform.position.x = -square.transform.position.x;
    tri.transform.scale.set(-Math.abs(Math.sin(x)));
    tri.draw(gl, projectionMatrix);

    requestAnimationFrame(draw.bind(this,gl));
}

function main()
{
    const canvas : HTMLCanvasElement = document.getElementById("glCanvas") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl");
    if (gl === null)
    {
        alert("WEBGL IS NOT AVAILABLE ON YOUR MACHINE!");
        return;
    }

    console.log("SupersonicJS Ready")

    let shader = new Shader(gl);
    imageShader = new ImageShader(gl, "../images/test32.png");

    square = new GeometryRenderable2D(gl, [
        1,1,
        -1,1,
        1,-1,
        -1,-1
    ],imageShader);

    colouredShader = new FlatShader(gl , 1, 0.5, 0.25, 1);

    tri = new GeometryRenderable2D(gl, [
        1,1,
        -1,1,
        1,-1
    ],colouredShader);


    square.transform.position.z = -6;
    tri.transform.position.z = -6;

    requestAnimationFrame(draw.bind(this,gl))

}

main();