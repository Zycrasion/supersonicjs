import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader"; 

export class FlatShader3D extends Shader
{
    colour : Vector4;
    constructor(gl : WebGL2RenderingContext, r : number, g : number , b : number, a : number)
    {
        super(gl);
        this.colour = new Vector4(r,g,b,a);
    }

    use(gl: WebGL2RenderingContext, callback : () => void): void {
        if (!this.check()) {return;}
        gl.useProgram(this.ShaderProgram);
        gl.uniform4fv(gl.getUniformLocation(this.ShaderProgram, "uColour"), this.colour.toFloat32Array());
        callback();
    }

    static create(gl : WebGL2RenderingContext) : FlatShader3D
    {
        let shader = new FlatShader3D(gl, 0,0,0,1);
        shader.fromFiles(gl,"3DFlat")
        return shader;
    }

}