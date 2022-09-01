import { mat4 } from "gl-matrix";

export const vsSource = `
attribute vec4 aVertexPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;

export const fsSource = `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

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

export function generateDefaultProjectionMatrix(gl : WebGLRenderingContext) : mat4
{
    const fov = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);
    return projectionMatrix;
}

export function initBuffers(gl : WebGLRenderingContext)
{
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    let positions = [
        1,1,
        -1,1,
        1,-1,
        -1,-1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return {
        position : posBuffer
    }
}


