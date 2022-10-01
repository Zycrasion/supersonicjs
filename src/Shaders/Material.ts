import { vec, Vector, Vector4 } from "../Transform/Vector";
import { Shader } from "./Shader";

export class Material
{
    Ambient : Vector = vec();
    Specular : Vector = vec();
    Diffuse : Vector = vec();
    Shiny : number = 32;

    constructor()
    {
        console.log(this);
    }

    set(gl : WebGL2RenderingContext, shader : Shader, name = "material")
    {
        shader.setShaderUniform_3fv(gl,name + ".ambient", this.Ambient);
        shader.setShaderUniform_3fv(gl,name + ".specular", this.Specular);
        shader.setShaderUniform_3fv(gl,name + ".diffuse", this.Diffuse);
        shader.setShaderUniform_1f (gl,name + ".shiny", this.Shiny)
    }
}   