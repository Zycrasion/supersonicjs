import { mat4 } from "gl-matrix";

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

export class ShaderDefaults
{
    static defaultFragment : string = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `

    static defaultVertex : string = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
    `
}

export class Shader
{
    ShaderProgram : WebGLProgram;
    constructor(gl: WebGLRenderingContext, VertexSource = ShaderDefaults.defaultVertex, FragmentSource = ShaderDefaults.defaultFragment)
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

    setShaderUniform_1i(gl : WebGLRenderingContext, uniformPositionName : string, x : number)
    {
        gl.uniform1i(
            gl.getUniformLocation(this.ShaderProgram, uniformPositionName),
            x
        );
    }

}