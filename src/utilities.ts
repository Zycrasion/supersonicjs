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

export class ProjectionMatrix
{
    static perspectiveDefault(gl : WebGLRenderingContext) : mat4
    {
        const fov = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();
    
        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);
        return projectionMatrix;
    }

    static orthographic(gl : WebGLRenderingContext) : mat4
    {
        const distance = 4; // Scale ortho distance 
        const fov = 1;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var width = gl.canvas.clientWidth;
        var height = gl.canvas.clientHeight;
        width /= height;
        const projectionMatrix = mat4.create();

        mat4.ortho(projectionMatrix, -width/2, width/2, -0.5, 0.5, 0.1, 100);
        return projectionMatrix;
    }
}

export class Math2
{
    static isPowerOf2(val : number)
    {
        return val % 2 == 0;
    }
}

export class UV
{
    static DefaultSquare(gl : WebGLRenderingContext)
    {
        const textureCoordinates = gl.createBuffer();

        const square = [
            1,1,
            -1,1,
            1,-1,
            -1,-1
        ]
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinates);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(square),
            gl.STATIC_DRAW
        );

        return textureCoordinates;
    }
}