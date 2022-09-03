import * as utils from "./utilities";
import {Vector, Vector4} from "./Vector";
import {Transform} from './Transform';
import {Shader, ShaderDefaults} from './Shaders/Shader'
import { FlatShader } from "./Shaders/FlatShader";
import { ImageShader } from "./Shaders/ImageShader";
import { InputAxis, InputManager } from "./InputManager/Input";
import { RenderableAbstract, GeometryRenderable2D } from "./Renderables";

export class SupersonicJS
{
    static Vector = Vector;
    static Vector4 = Vector4;
    static utils = utils; 
    static Transform =Transform;
    static Shaders = {Shader, ImageShader, FlatShader};
    static ShaderDefaults = ShaderDefaults;
    static Input = {InputAxis, InputManager};
    static RenderableAbstract = RenderableAbstract;
    static GeometryRenderable2D = GeometryRenderable2D;
    static init(canvasid : string, clearColour : Vector4) : WebGLRenderingContext
    {
        let gl = (document.getElementById(canvasid) as HTMLCanvasElement).getContext("webgl");
        if (gl === null)
        {
            alert("Your device does not support WebGL")
            return null;
        }
        gl.clearColor(clearColour.x,clearColour.y,clearColour.z,clearColour.w);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        return gl;
    }
    static clear(gl : WebGLRenderingContext)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    
    }
}