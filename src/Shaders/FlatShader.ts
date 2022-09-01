import { Vector, Vector4 } from "../Vector";
import { Shader } from "./Shader";

export class FlatShader extends Shader
{
    colour : Vector4;
    constructor(gl : WebGLRenderingContext, r : number, g : number , b : number, a : number)
    {
        super(gl,`
        attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
        `,`
            precision mediump float;
            uniform vec4 uColour;

            void main() {
                gl_FragColor = uColour;
            }
        `);
        this.colour = new Vector4(r,g,b,a);
    }

    use(gl: WebGLRenderingContext): void {
        gl.useProgram(this.ShaderProgram);
        gl.uniform4fv(gl.getUniformLocation(this.ShaderProgram, "uColour"), this.colour.toFloat32Array())
    }

}