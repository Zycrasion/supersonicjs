import { mat4, quat, vec3 } from "gl-matrix";
import { BufferSonic } from "./Abstraction/Buffer";
import { Vector } from "./Transform/Vector";


export interface Dict<Type>
{
    [key: string]: Type
}
export class ProjectionMatrix
{
    static perspectiveDefault(gl: WebGLRenderingContext): mat4
    {
        const fov = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 1000.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);
        return projectionMatrix;
    }

    static orthographic(gl: WebGLRenderingContext, scale: number = 1): mat4
    {
        const distance = 4; // Scale ortho distance 
        const fov = 1;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var width = gl.canvas.clientWidth;
        var height = gl.canvas.clientHeight;
        width /= height;
        width *= scale;
        height = scale;
        const projectionMatrix = mat4.create();

        mat4.ortho(projectionMatrix, -width / 2, width / 2, -height / 2, height / 2, 0.1, 100);
        return projectionMatrix;
    }
}

export class Math2
{
    static isPowerOf2(x: number)
    {
        return Math.log2(x) % 1 === 0;
    }

    static copySign(x, y)
    {
        return Math.sign(x) === Math.sign(y) ? x : -x;
    }

    // https://github.com/toji/gl-matrix/issues/329
    static getEuler(out: Vector, quat: DOMPointReadOnly): Vector
    {
        let x = quat.x,
            y = quat.y,
            z = quat.z,
            w = quat.w,
            x2 = x * x,
            y2 = y * y,
            z2 = z * z,
            w2 = w * w;
        let unit = x2 + y2 + z2 + w2;
        let test = x * w - y * z;
        if (test > 0.499995 * unit)
        { //TODO: Use glmatrix.EPSILON
            // singularity at the north pole
            out.x = Math.PI / 2;
            out.y = 2 * Math.atan2(y, x);
            out.z = 0;
        } else if (test < -0.499995 * unit)
        { //TODO: Use glmatrix.EPSILON
            // singularity at the south pole
            out.x = -Math.PI / 2;
            out.y = 2 * Math.atan2(y, x);
            out.z = 0;
        } else
        {
            out.x = Math.asin(2 * (x * z - w * y));
            out.y = Math.atan2(2 * (x * w + y * z), 1 - 2 * (z2 + w2));
            out.z = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
        }
        // TODO: Return them as degrees and not as radians
        return out;
    }
}

export class PointerLock
{
    static locked = false;
    private static element: HTMLCanvasElement;

    private static mousedown()
    {
        PointerLock.element.requestPointerLock();
        if (!PointerLock.locked)
        {
            document.removeEventListener("mousedown", PointerLock.mousedown)
        }
    }

    static Lock(canvas: string | HTMLCanvasElement)
    {
        let canvasElement: HTMLCanvasElement;
        if (typeof canvas == "string")
        {
            canvasElement = document.getElementById(canvas) as HTMLCanvasElement;
        } else
        {
            canvasElement = canvas;
        }
        canvasElement.requestPointerLock();
        document.addEventListener("mousedown", PointerLock.mousedown);
        PointerLock.locked = true;
        PointerLock.element = canvasElement;
    }

    static Unlock()
    {
        document.removeEventListener("mousedown", PointerLock.mousedown);
        PointerLock.locked = false;
    }
}

export class UV
{
    static legacy = {
        DefaultSquare: (gl: WebGL2RenderingContext) =>
        {
            const textureCoordinates = gl.createBuffer();

            const square = [
                1, 1,
                0, 1,
                1, 0,
                0, 0
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

    static DefaultSquare(gl: WebGL2RenderingContext): BufferSonic
    {

        const square = [
            1, 1,
            0, 1,
            1, 0,
            0, 0
        ]

        const textureCoordinates = new BufferSonic(gl, new Float32Array(square), square.length);

        return textureCoordinates;
    }
}