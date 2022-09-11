import { mat4 } from "gl-matrix";
import { type } from "os";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Dict } from "../utilities";

export function createShader(gl : WebGL2RenderingContext, type : number, source : string)
{
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(`An error has occured while compiling a shader.
        ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


export function createShaderProgram(gl: WebGL2RenderingContext, vsSource : string, fsSource : string)
{
    // vertex shader, fragment shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    {
        alert(`An error has occured while linking shader program.
        ${gl.getProgramInfoLog(program)}`);
        return null;
    }

    return program;
}



export class Shader
{
    ShaderProgram : WebGLProgram;


    static shaderpath = "/Shaders";

    constructor(gl: WebGL2RenderingContext, VertexSource : undefined | string = null, FragmentSource : undefined | string = null)
    {
        if (VertexSource == null || FragmentSource == null)
        {
           return;
        } else {
            this.createProgram(gl, VertexSource, FragmentSource);
        }
    }

    createProgram(gl: WebGL2RenderingContext, VertexSource : string, FragmentSource : string )
    {
        this.ShaderProgram = createShaderProgram(gl, VertexSource, FragmentSource)
    }

    // Yes i know this can be shortened but i think it looks better like this
    check()
    {
        if (this.ShaderProgram==undefined)
        {
            return false;
        }
        return true;
    }

    use(gl : WebGL2RenderingContext, callback : () => void)
    {
        if (!this.check()) {return;}
        gl.useProgram(this.ShaderProgram);
        callback();
    }

    enableVertexAttrib(gl : WebGL2RenderingContext, buffer : WebGLBuffer, vertexPositionName = "aVertexPosition")
    {
        if (!this.check()) {return;}
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

    setShaderUniform_mat4fv(gl : WebGL2RenderingContext, uniformPositionName : string, matrix : mat4)
    {
        if (!this.check()) {return;}
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName), // Uniform to set
            false,
            matrix
        )
    }

    setShaderUniform_1i(gl : WebGL2RenderingContext, uniformPositionName : string, x : number)
    {
        if (!this.check()) {return;}
        gl.uniform1i(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x
        );
    }

    setShaderUniform_4fv(gl : WebGL2RenderingContext, uniformPositionName : string, x : Vector4)
    {
        if (!this.check()) {return;}
        gl.uniform4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x.toFloat32Array()
        );
    }

    setShaderUniform_3fv(gl : WebGL2RenderingContext, uniformPositionName : string, x : Vector)
    {
        if (!this.check()) {return;}
        gl.uniform3fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x.toFloat32Array()
        );
    }


    protected async fromFiles(gl : WebGL2RenderingContext,  folderName : string)
    {
        let vertexSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/vertex.vert`);
        let fragmentSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/fragment.frag`);

        this.createProgram(gl,vertexSource,fragmentSource);
    }

    // Preferred Method of Instatiating
    static create(gl : WebGL2RenderingContext) : Shader
    {
        let shader = new Shader(gl);
        shader.fromFiles(gl,"Default")
        return shader;
    }
}