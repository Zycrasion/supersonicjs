import * as utils from "./utilities";
import {Vector, Vector4} from "./Transform/Vector";
import {Transform} from './Transform/Transform';
import {Shader, createShader, createShaderProgram} from './Shaders/Shader'
import { FlatShader } from "./Shaders/FlatShader";
import { ImageShader } from "./Shaders/ImageShader";
import { InputAxis, InputManager } from "./InputManager/Input";
import { RenderableAbstract, GeometryRenderable2D } from "./Renderables/Renderables";
import { HTTP_REQUEST } from "./Request/httpRequest";

export class SupersonicJS
{
    static Vector = Vector;
    static Vector4 = Vector4;
    static utils = utils; 
    static Transform =Transform;
    static Shaders = {Shader, ImageShader, FlatShader, createShader, createShaderProgram};
    static Input = {InputAxis, InputManager};
    static RenderableAbstract = RenderableAbstract;
    static GeometryRenderable2D = GeometryRenderable2D;
    static HTTP = { HTTP_REQUEST }
    static init(canvasid : string, clearColour : Vector4) : WebGL2RenderingContext
    {
        let gl = (document.getElementById(canvasid) as HTMLCanvasElement).getContext("webgl2");
        if (gl === null)
        {
            alert("Your device does not support WebGL2")
            return null;
        }
        gl.clearColor(clearColour.x,clearColour.y,clearColour.z,clearColour.w);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        return gl;
    }
    static clear(gl : WebGL2RenderingContext)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
    }
}