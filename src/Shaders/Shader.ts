import { mat4 } from "gl-matrix";
import { type } from "os";
import { HTTP_REQUEST } from "../Request/httpRequest";

export function createShader(gl : WebGLRenderingContext, type : number, source : string)
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


export function createShaderProgram(gl: WebGLRenderingContext, vsSource : string, fsSource : string)
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

    constructor(gl: WebGLRenderingContext, VertexSource : undefined | string = null, FragmentSource : undefined | string = null)
    {
        if (VertexSource == null || FragmentSource == null)
        {
           return;
        } else {
            this.createProgram(gl, VertexSource, FragmentSource);
        }
    }

    createProgram(gl: WebGLRenderingContext, VertexSource : string, FragmentSource : string )
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

    use(gl : WebGLRenderingContext, callback : () => void)
    {
        if (!this.check()) {return;}
        gl.useProgram(this.ShaderProgram);
        callback();
    }

    enableVertexAttrib(gl : WebGLRenderingContext, buffer : WebGLBuffer, vertexPositionName = "aVertexPosition")
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

    setShaderUniform_mat4fv(gl : WebGLRenderingContext, uniformPositionName : string, matrix : mat4)
    {
        if (!this.check()) {return;}
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName), // Uniform to set
            false,
            matrix
        )
    }

    setShaderUniform_1i(gl : WebGLRenderingContext, uniformPositionName : string, x : number)
    {
        if (!this.check()) {return;}
        gl.uniform1i(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x
        );
    }

    protected async fromFiles(gl : WebGLRenderingContext,  folderName : string)
    {
        let vertexSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/vertex.vert`);
        let fragmentSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/fragment.frag`);

        this.createProgram(gl,vertexSource,fragmentSource);
    }

    // Preferred Method of Instatiating
    static create(gl : WebGLRenderingContext) : Shader
    {
        let shader = new Shader(gl);
        shader.fromFiles(gl,"Default")
        return shader;
    }
}