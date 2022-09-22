import { mat4 } from "gl-matrix";
import { threadId } from "worker_threads";
import { Loader } from "../Loader/Loader";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader";

export class FlatShader3D extends Shader
{
    colour: Vector4;
    cameraMatrix: mat4;

    constructor(gl: WebGL2RenderingContext, r: number, g: number, b: number, a: number)
    {
        super(gl);
        this.colour = new Vector4(r, g, b, a);
    }

    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.check()) { return; }
        gl.useProgram(this.ShaderProgram);
        this.setShaderUniform_4fv(gl, "uColour", this.colour);
        this.setShaderUniform_mat4fv(gl, "CameraMatrix", this.cameraMatrix);
        callback();
    }

    static registerLoad(loader: Loader): void
    {
        this.registerLoadItems(loader, "3DFlat");
    }

    fromLoad(gl: WebGL2RenderingContext, loader: Loader): void
    {
        this.fromLoadItems(gl, loader, "3DFlat")
    }

    static create(gl: WebGL2RenderingContext): FlatShader3D
    {
        let shader = new FlatShader3D(gl, 0, 0, 0, 1);
        shader.fromFiles(gl, "3DFlat")
        return shader;
    }

}

export class Shaded3D extends Shader
{
    Colour: Vector;
    LightColour: Vector;
    LightPosition: Vector;
    viewPos: Vector;
    cameraMatrix: mat4;

    constructor(gl: WebGL2RenderingContext, r: number, g: number, b: number, a: number)
    {
        super(gl);
        this.Colour = new Vector(1, 1, 1);
        this.LightColour = new Vector(1, 1, 1);
        this.LightPosition = new Vector(1, 1, 1);
    }

    use(gl: WebGL2RenderingContext, callback: () => void = () => {}): void
    {
        if (!this.check()) { return; }
        gl.useProgram(this.ShaderProgram);
        this.setShaderUniform_3fv(gl, "uColour", this.Colour);
        this.setShaderUniform_3fv(gl, "uLight", this.LightColour);
        this.setShaderUniform_3fv(gl, "uLightPos", this.LightPosition);
        this.setShaderUniform_3fv(gl, "uCameraPosition", this.viewPos);
        this.setShaderUniform_mat4fv(gl, "CameraMatrix", this.cameraMatrix)
        callback();
    }

    static registerLoad(loader: Loader): void
    {
        this.registerLoadItems(loader, "3DShaded");
    }

    fromLoad(gl: WebGL2RenderingContext, loader: Loader): void
    {
        this.fromLoadItems(gl, loader, "3DShaded")
    }

    static create(gl: WebGL2RenderingContext): Shaded3D
    {
        let shader = new Shaded3D(gl, 0, 0, 0, 1);
        shader.fromFiles(gl, "3DShaded")
        return shader;
    }
}