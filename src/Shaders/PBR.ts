import { Loader } from "../Loader/Loader";
import { ITexture } from "../Renderables/Texture";
import { vec, Vector } from "../Transform/Vector";
import { Shader3D } from "./3DShader";
import { Light } from "./LightSource";
import { BaseMaterial, Material } from "./Material";
import { Shader } from "./Shader";

export class PBRMaterial implements BaseMaterial
{

    diffuse: ITexture;
    specular: ITexture;
    shininess: number;

    constructor()
    {
        this.shininess = 64;
    }

    /**
     * @description doesnt actually return a copy, just a pointer
     * @returns {PBRMaterial}
     */
    copy(): PBRMaterial
    {
        return this;
    }

    setUniforms(gl: WebGL2RenderingContext, shader: Shader, name = "material"): void
    {
        this.diffuse.bind(gl, gl.TEXTURE0);
        this.specular.bind(gl, gl.TEXTURE1);
        shader.setShaderUniform_1i(gl, name + ".diffuse", 0);
        shader.setShaderUniform_1i(gl, name + ".specular", 1);
        shader.setShaderUniform_1f(gl, name + ".shininess", this.shininess);
    }
}

export class PBRShader extends Shader3D
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

    useMaterial(gl: WebGL2RenderingContext, material: PBRMaterial)
    {
        if (!this.bind(gl)) { return; }
        material.setUniforms(gl, this, "material");
    }

    useLight(gl: WebGL2RenderingContext, light: Light)
    {
        if (!this.bind(gl)) { return; }
        light.setUniforms(gl, this, "light");
    }

    static Register(): void
    {
        this.Register_Abstract("PBR");
    }

    static create(gl: WebGL2RenderingContext): PBRShader
    {
        let shader = new PBRShader(gl);
        shader.fromFiles(gl, "PBR")
        return shader;
    }
}