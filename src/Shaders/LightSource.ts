import { vec, Vector } from "../Transform/Vector";
import { Material } from "./Material";
import { Shader } from "./Shader";

export class Light extends Material
{
    position: Vector;
    constructor()
    {
        super();
        this.position = vec();
    }
    setUniforms(gl: WebGL2RenderingContext, shader: Shader, name = "light"): void
    {
        super.setUniforms(gl, shader, name);
        shader.setShaderUniform_3fv(gl, name + ".position", this.position);
    }
}