import { vec, Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader";

export abstract class BaseMaterial
{
    abstract setUniforms(gl : WebGL2RenderingContext, shader : Shader, name)

    abstract copy() : BaseMaterial
}

export class Material extends BaseMaterial
{
    ambient: Vector;
    specular: Vector;
    diffuse: Vector;
    shiny: number;

    constructor()
    {
        super();
        this.ambient = vec();
        this.specular = vec();
        this.diffuse = vec();
        this.shiny = 32;
    }

    copy(): BaseMaterial
    {
        let material = new Material();
        material.ambient = this.ambient.copy();
        material.specular= this.specular.copy();
        material.diffuse = this.diffuse.copy();
        return material;
    }

    setColour(col: Vector)
    {
        this.ambient = col.copy();
        this.diffuse = col.copy();
        this.specular = col.copy();
    }

    setUniforms(gl: WebGL2RenderingContext, shader: Shader, name = "material")
    {
        shader.setShaderUniform_3fv(gl, name + ".ambient", this.ambient);
        shader.setShaderUniform_3fv(gl, name + ".specular", this.specular);
        shader.setShaderUniform_3fv(gl, name + ".diffuse", this.diffuse);
        shader.setShaderUniform_1f(gl, name + ".shiny", this.shiny)
    }
}