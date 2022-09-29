import { mat4 } from "gl-matrix";
import { threadId } from "worker_threads";
import { Loader } from "../Loader/Loader";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader";


export class Shader3D extends Shader
{
     ViewMatrix: mat4;
     ProjectionMatrix: mat4;
     ModelViewMatrix: mat4;

    protected Colour: Vector4;

    setColour(colour: Vector4) { this.Colour = colour; }

    getColour() { return this.Colour.copy() }

    setViewMatrix(matrix: mat4) { this.ViewMatrix = matrix }

    getViewMatrix() {return mat4.clone(this.ViewMatrix)}

    setProjectionMatrix(matrix: mat4) { this.ProjectionMatrix = matrix }

    getProjectionMatrix() { return mat4.clone(this.ProjectionMatrix) }

    setModelViewMatrix(matrix: mat4) { this.ModelViewMatrix = matrix }

    getModelViewMatrix() { return this.ModelViewMatrix }

    protected defaults(gl: WebGL2RenderingContext): boolean
    {
        if (!this.check()) { return false }

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

export class Flat3D extends Shader3D
{

    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);
    }

    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.defaults(gl)) { return; }
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

    static create(gl: WebGL2RenderingContext): Flat3D
    {
        let shader = new Flat3D(gl);
        shader.fromFiles(gl, "3DFlat")
        return shader;
    }

}

export class Shaded3D extends Shader3D
{
    LightColour: Vector;
    LightPosition: Vector;
    viewPos: Vector;

    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);
        this.Colour = new Vector4();
        this.LightColour = new Vector(1, 1, 1);
        this.LightPosition = new Vector(1, 1, 1);
    }

    use(gl: WebGL2RenderingContext, callback: () => void = () => { }): void
    {
        if (!this.defaults(gl)) { return; }
        this.setShaderUniform_3fv(gl, "uLight", this.LightColour);
        this.setShaderUniform_3fv(gl, "uLightPos", this.LightPosition);
        this.setShaderUniform_3fv(gl, "uCameraPosition", this.viewPos);
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
        let shader = new Shaded3D(gl);
        shader.fromFiles(gl, "3DShaded")
        return shader;
    }
}