import { mat4 } from "gl-matrix";
import { BufferSonic } from "./Abstraction/Buffer";


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
        DefaultSquare : (gl: WebGL2RenderingContext) =>
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
    
    static DefaultSquare(gl : WebGL2RenderingContext) : BufferSonic
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