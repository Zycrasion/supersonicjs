import { vec, Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader";

export class Material
{
    ambient: Vector;
    specular: Vector;
    diffuse: Vector;
    shiny: number;

    constructor()
    {
        this.ambient = vec();
        this.specular = vec();
        this.diffuse = vec();
        this.shiny = 32;
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