import { mat4 } from "gl-matrix";
import { vec, Vector } from "../Transform/Vector";
import { BaseMaterial, Material } from "./Material";
import { Shader } from "./Shader";

export class Light implements BaseMaterial
{
    position: Vector;
    ambient: Vector;
    diffuse: Vector;
    specular: Vector;

    lightSpaceTransform : mat4;
    readonly lookAt : Vector;

    constructor(pos : Vector, lookAt : Vector)
    {
        this.position = pos;
        this.setColour(vec());

        this.lookAt = lookAt;

        let lightProjection = mat4.ortho(
            mat4.create(),
            -10, 10,
            -10, 10,
            1.0, 100
        );

        let lightTransform = mat4.lookAt(
            mat4.create(),
            this.position.toFloat32Array(),
            lookAt.toFloat32Array(),
            [0,1,0]
        )

        this.lightSpaceTransform = mat4.multiply(
            mat4.create(),
            lightProjection,
            lightTransform
        )

    }

    setColour(col: Vector)
    {
        let c = col.copy().normalize();
        this.ambient = c.copy().div(5);
        this.diffuse = c.copy().div(2);
        this.specular = c;
    }

    copy(): Light
    {
        let l = new Light(this.position, this.lookAt);
        l.setColour(this.specular)
        return l
    }

    setUniforms(gl: WebGL2RenderingContext, shader: Shader, name = "light")
    {
        shader.setShaderUniform_3fv(gl, name + ".ambient", this.ambient);
        shader.setShaderUniform_3fv(gl, name + ".specular", this.specular);
        shader.setShaderUniform_3fv(gl, name + ".diffuse", this.diffuse);
        shader.setShaderUniform_3fv(gl, name + ".position", this.position);
        shader.setShaderUniform_mat4fv(gl, "lightSpaceMatrix", this.lightSpaceTransform);   
    }
}