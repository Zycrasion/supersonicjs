import { Loader } from "../Loader/Loader";
import { Texture } from "../Renderables/Texture";
import { vec, Vector } from "../Transform/Vector";
import { Shader3D } from "./3DShader";
import { Light } from "./LightSource";
import { BaseMaterial, Material } from "./Material";
import { Shader } from "./Shader";

export class PBRMaterial implements BaseMaterial
{

    diffuse: Texture;
    specular: Texture;
    shininess: number;

    constructor()
    {
        this.shininess = 32;
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

    material: PBRMaterial;
    light: Light;
    cameraPosition: Vector;

    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);
        this.light = new Light();
        this.material = new PBRMaterial();
        this.cameraPosition = vec();
    }

    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.defaults(gl)) { return; }

        this.material.setUniforms(gl, this, "material");
        this.light.setUniforms(gl, this, "light");
        this.setShaderUniform_3fv(gl, "uCameraPosition", this.cameraPosition);

        callback();
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