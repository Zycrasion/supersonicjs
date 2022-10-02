import { vec, Vector } from "../Transform/Vector";
import { BaseMaterial, Material } from "./Material";
import { Shader } from "./Shader";

export class Light implements BaseMaterial
{
    position: Vector;
    ambient: Vector;
    diffuse: Vector;
    specular: Vector;


    constructor()
    {
        this.position = vec();
        this.setColour(vec());
    }

    setColour(col: Vector)
    {
        this.ambient = col.copy();
        this.diffuse = col.copy();
        this.specular = col.copy();
    }

    setUniforms(gl: WebGL2RenderingContext, shader: Shader, name = "light")
    {
        shader.setShaderUniform_3fv(gl, name + ".ambient", this.ambient);
        shader.setShaderUniform_3fv(gl, name + ".specular", this.specular);
        shader.setShaderUniform_3fv(gl, name + ".diffuse", this.diffuse);
        shader.setShaderUniform_3fv(gl, name + ".position", this.position);

    }


}