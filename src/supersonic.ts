import { vec4, Vector4 } from "./Transform/Vector";

export class SupersonicJS
{
    static PRODUCTION = false;

    static clearColour = vec4();

    static warn(message?: string, optionalParameters?: any[])
    {
        if (this.PRODUCTION)
        {
            return;
        }
        console.warn(message, optionalParameters);
    }

    static error(message?: string, optionalParameters?: any[])
    {
        if (this.PRODUCTION)
        {
            return;
        }
        console.error(message, optionalParameters);
    }
    static setClearColour(gl: WebGL2RenderingContext, clearColour = SupersonicJS.clearColour)
    {
        gl.clearColor(clearColour.x, clearColour.y, clearColour.z, clearColour.w);
        gl.clearDepth(1);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        SupersonicJS.clearColour = clearColour;
    }

    static init(canvasid: string, clearColour: Vector4, attribs: WebGLContextAttributes = {}): WebGL2RenderingContext
    {
        let gl = (document.getElementById(canvasid) as HTMLCanvasElement).getContext("webgl2", attribs);
        if (gl === null)
        {
            alert("Your device does not support WebGL2")
            return null;
        }
        SupersonicJS.clearColour = clearColour;
        this.setClearColour(gl);
        return gl;
    }

    static createCanvas(id = "SUPERSONIC_CANVAS"): HTMLCanvasElement
    {
        let canvas = document.createElement("canvas");
        canvas.id = id;
        canvas.width = 1080;
        canvas.height = 720;
        document.body.appendChild(canvas);
        return canvas;
    }

    static clear(gl: WebGL2RenderingContext)
    {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
}
// Shortened
export const sonic = SupersonicJS;
