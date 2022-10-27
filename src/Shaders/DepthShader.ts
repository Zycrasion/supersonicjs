import { Shader3D } from "./3DShader";
import { Light } from "./LightSource";

export class DepthShader extends Shader3D
{
    constructor(gl: WebGL2RenderingContext)
    {
        super(gl);

    }

    use(gl: WebGL2RenderingContext, callback: () => void = () => { }): void
    {
        if (!this.bind(gl)) { return; }

        this.setShaderUniform_mat4fv(gl, "uModelViewMatrix", this.ModelViewMatrix)
        callback();
    }

    useLight(gl: WebGL2RenderingContext, light: Light): void
    {
        if (!this.bind(gl)) { return }
        light.setUniforms(gl, this, "light");
    }

    static Register(): void
    {
        this.Register_Abstract("DepthShader");
    }

    static create(gl: WebGL2RenderingContext): DepthShader
    {
        let shader = new DepthShader(gl);
        shader.fromFiles(gl, "DepthShader")
        return shader;
    }
}