import { Vector4 } from "./Transform/Vector";


export class SupersonicJS
{
    static init(canvasid: string, clearColour: Vector4, attribs : WebGLContextAttributes = {}): WebGL2RenderingContext
    {
        let gl = (document.getElementById(canvasid) as HTMLCanvasElement).getContext("webgl2",attribs);
        if (gl === null)
        {
            alert("Your device does not support WebGL2")
            return null;
        }
        gl.clearColor(clearColour.x, clearColour.y, clearColour.z, clearColour.w);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        return gl;
    }
    static clear(gl: WebGL2RenderingContext)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}