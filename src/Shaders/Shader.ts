import { mat4 } from "gl-matrix";
import { createShaderProgram, fsSource, vsSource } from "../utilities";

export class Shader
{
    ShaderProgram : WebGLProgram;
    constructor(gl: WebGLRenderingContext, VertexSource = vsSource, FragmentSource = fsSource)
    {
        this.ShaderProgram = createShaderProgram(gl, VertexSource, FragmentSource)
    }

    use(gl : WebGLRenderingContext)
    {
        gl.useProgram(this.ShaderProgram);
    }

    enableVertexAttrib(gl : WebGLRenderingContext, buffer : WebGLBuffer, vertexPositionName = "aVertexPosition")
    {
        let size = 2;
        let type = gl.FLOAT;
        let normalize = false; // dont normalize (map values to 0-1)
        let stride = 0; // 0 use size and type above
        let offset = 0; 
        
        let vertexPositionLoc = gl.getAttribLocation(this.ShaderProgram, vertexPositionName);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.vertexAttribPointer(
            vertexPositionLoc,
            size,
            type,
            normalize,
            stride,
            offset
        );
        gl.enableVertexAttribArray(vertexPositionLoc);
    }

    setShaderUniform_mat4fv(gl : WebGLRenderingContext, uniformPositionName : string, matrix : mat4)
    {
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName), // Uniform to set
            false,
            matrix
        )
    }

}