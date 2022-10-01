import { mat4 } from "gl-matrix";
import { threadId } from "worker_threads";
import { Loader } from "../Loader/Loader";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Light } from "./LightSource";
import { Material } from "./Material";
import { Shader } from "./Shader";


export class Shader3D extends Shader
{
    protected ViewMatrix: mat4;
    protected ProjectionMatrix: mat4;
    protected ModelViewMatrix: mat4;

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

    protected Colour: Vector4;

    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);
    }

    setColour(colour: Vector4) { this.Colour = colour; }

    getColour() { return this.Colour.copy() }


    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.defaults(gl)) { return; }
        this.setShaderUniform_4fv(
            gl,
            "uColour",
            this.Colour
        );
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
    viewPos: Vector;

    material: Material;
    light: Light;

    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);
        this.light = new Light();
        this.material = new Material();
    }

    use(gl: WebGL2RenderingContext, callback: () => void = () => { }): void
    {
        if (!this.defaults(gl)) { return; }

        this.material.setUniforms(gl, this);
        this.light.setUniforms(gl, this);
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