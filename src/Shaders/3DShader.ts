import { mat4, vec2 } from "gl-matrix";
import { Loader } from "../Loader/Loader";
import { Vector, Vector4 } from "../Transform/Vector";
import { Light } from "./LightSource";
import { BaseMaterial, Material } from "./Material";
import { PBRMaterial } from "./PBR";
import { Shader } from "./Shader";


export class Shader3D extends Shader
{
    protected ViewMatrix: mat4;
    protected ProjectionMatrix: mat4;
    protected ModelViewMatrix: mat4;
    protected viewPos: Vector;

    setViewPos(v: Vector) { this.viewPos = v }

    getViewPos() { return this.viewPos }

    setViewMatrix(matrix: mat4) { this.ViewMatrix = matrix }

    getViewMatrix() { return mat4.clone(this.ViewMatrix) }

    setProjectionMatrix(matrix: mat4) { this.ProjectionMatrix = matrix }

    getProjectionMatrix() { return mat4.clone(this.ProjectionMatrix) }

    setModelViewMatrix(matrix: mat4) { this.ModelViewMatrix = matrix }

    getModelViewMatrix() { return this.ModelViewMatrix }

    useMaterial(gl : WebGL2RenderingContext, material : BaseMaterial) {}

    useLight(gl : WebGL2RenderingContext, light : Light) {}

    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.defaults(gl)) { return; }
        callback();
    }

    bind(gl: WebGL2RenderingContext)
    {
        if (!this.hasLoaded()) { return false; }
        gl.useProgram(this.ShaderProgram);
        return true;
    }

    protected defaults(gl: WebGL2RenderingContext): boolean
    {
        if (!this.bind(gl)) { return false }

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

/**
 * @deprecated
 */
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

    static Register(): void
    {
        this.Register_Abstract("3DFlat");
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
    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);

    }

    use(gl: WebGL2RenderingContext, callback: () => void = () => { }): void
    {
        if (!this.defaults(gl)) { return; }

        this.setShaderUniform_3fv(gl, "uCameraPosition", this.viewPos);
        callback();
    }

    useLight(gl: WebGL2RenderingContext, light: Light): void
    {
        if (!this.bind(gl)) {return}
        light.setUniforms(gl, this, "light");
    }

    useMaterial(gl: WebGL2RenderingContext, material: BaseMaterial): void
    {
        if (!this.bind(gl)) {return}
        material.setUniforms(gl, this, "material")
    }

    /** @deprecated */
    updateUniforms(gl: WebGL2RenderingContext)
    {
        if (!this.bind(gl))
        {
            setTimeout(this.updateUniforms.bind(this, gl), 100); // Wait for shader to load
        }
    }

    static Register(): void
    {
        this.Register_Abstract("3DShaded");
    }

    static create(gl: WebGL2RenderingContext): Shaded3D
    {
        let shader = new Shaded3D(gl);
        shader.fromFiles(gl, "3DShaded")
        return shader;
    }
}