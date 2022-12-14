import { mat4 } from "gl-matrix";
import { Loader } from "../Loader/Loader";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";

export function createShader(gl: WebGL2RenderingContext, type: number, source: string, name = "a shader")
{
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert(`An error has occured while compiling ${name}.
        ${gl.getShaderInfoLog(shader)}`);
        console.log(`An error has occured while compiling ${name}.
        ${gl.getShaderInfoLog(shader)} ${source}`);
        gl.deleteShader(shader)
        gl.deleteShader(shader)
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}


export function createShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string)
{
    // vertex shader, fragment shader
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource, "vertex shader");
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource, "fragment shader");

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

interface ShaderSource
{
    Vertex: string;
    Fragment: string;
}

export class Shader
{
    ShaderProgram: WebGLProgram;
    source: ShaderSource | null;

    static shaderpath = "/Shaders";

    constructor(gl: WebGL2RenderingContext, VertexSource: undefined | string = null, FragmentSource: undefined | string = null)
    {
        if (VertexSource == null || FragmentSource == null)
        {
            this.source = null;
            return;
        } else
        {
            this.source = {
                Vertex: VertexSource,
                Fragment: FragmentSource,
            }
            this.createProgram(gl, VertexSource, FragmentSource);
        }
    }

    createProgram(gl: WebGL2RenderingContext, VertexSource: string, FragmentSource: string)
    {
        this.ShaderProgram = createShaderProgram(gl, VertexSource, FragmentSource)
    }

    // Yes i know this can be shortened but i think it looks better like this
    hasLoaded()
    {
        if (this.ShaderProgram == undefined)
        {
            return false;
        }
        return true;
    }

    use(gl: WebGL2RenderingContext, callback: () => void)
    {
        if (!this.hasLoaded()) { return; }
        gl.useProgram(this.ShaderProgram);
        callback();
    }

    copy(gl: WebGL2RenderingContext): Shader
    {
        let copy = new Shader(gl, this.source?.Vertex, this.source?.Fragment);
        return copy;
    }

    enableVertexAttrib(gl: WebGL2RenderingContext, buffer: WebGLBuffer, vertexPositionName = "aVertexPosition")
    {
        if (!this.hasLoaded()) { return; }
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

    updateUniforms(gl: WebGL2RenderingContext)
    {
    }

    setShaderUniform_mat4fv(gl: WebGL2RenderingContext, uniformPositionName: string, matrix: mat4)
    {
        if (!this.hasLoaded()) { return; }
        gl.uniformMatrix4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName), // Uniform to set
            false,
            matrix
        )
    }

    setShaderUniform_1i(gl: WebGL2RenderingContext, uniformPositionName: string, x: number)
    {
        if (!this.hasLoaded()) { return; }
        gl.uniform1i(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x
        );
    }

    setShaderUniform_1f(gl: WebGL2RenderingContext, uniformPositionName: string, x: number)
    {
        if (!this.hasLoaded()) { return; }
        gl.uniform1f(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x
        );
    }

    setShaderUniform_4fv(gl: WebGL2RenderingContext, uniformPositionName: string, x: Vector4)
    {
        if (!this.hasLoaded()) { return; }
        gl.uniform4fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x.toFloat32Array()
        );
    }

    setShaderUniform_3fv(gl: WebGL2RenderingContext, uniformPositionName: string, x: Vector)
    {
        if (!this.hasLoaded()) { return; }
        gl.uniform3fv(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x.toFloat32Array(),
            0,
            3
        );
    }



    protected async fromFiles(gl: WebGL2RenderingContext, folderName: string)
    {
        let vertexSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/vertex.vert`);
        let fragmentSource = await HTTP_REQUEST(`${Shader.shaderpath}/${folderName}/fragment.frag`);
        this.createProgram(gl, vertexSource, fragmentSource);
    }

    protected static Register_Abstract(id: string)
    {
        Loader.CacheHTTP(`${Shader.shaderpath}/${id}/vertex.vert`);
        Loader.CacheHTTP(`${Shader.shaderpath}/${id}/fragment.frag`);
    }

    static Register()
    {
        Shader.Register_Abstract("Default");
    }

    // Preferred Method of Instatiating
    static create(gl: WebGL2RenderingContext): Shader
    {
        let shader = new Shader(gl);
        shader.fromFiles(gl, "Default")
        return shader;
    }
}

export class Shader2D extends Shader
{
    protected ViewMatrix: mat4;
    protected ProjectionMatrix: mat4;
    protected ModelViewMatrix: mat4;

    protected Colour: Vector4;

    setColour(colour: Vector4) { this.Colour = colour; }

    getColour() { return this.Colour.copy() }

    setViewMatrix(matrix: mat4) { this.ViewMatrix = matrix }

    getViewMatrix() { return mat4.clone(this.ViewMatrix) }

    setProjectionMatrix(matrix: mat4) { this.ProjectionMatrix = matrix }

    getProjectionMatrix() { return mat4.clone(this.ProjectionMatrix) }

    setModelViewMatrix(matrix: mat4) { this.ModelViewMatrix = matrix }

    getModelViewMatrix() { return this.ModelViewMatrix }

    protected defaults(gl: WebGL2RenderingContext): boolean
    {
        if (!this.hasLoaded()) { return false }

        gl.useProgram(this.ShaderProgram);
        this.setShaderUniform_4fv(
            gl,
            "uColour",
            this.Colour
        );

        this.setShaderUniform_mat4fv(
            gl,
            "uCameraMatrix",
            this.getViewMatrix()
        );

        this.setShaderUniform_mat4fv(
            gl,
            "uProjectionMatrix",
            this.getProjectionMatrix()
        );

        this.setShaderUniform_mat4fv(
            gl,
            "uModelViewMatrix",
            this.getModelViewMatrix()
        );
        return true;
    }
}