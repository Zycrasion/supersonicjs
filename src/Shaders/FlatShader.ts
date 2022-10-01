import { HTTP_REQUEST } from "../Request/httpRequest";
import { Vector, Vector4 } from "../Transform/Vector";
import { Shader, Shader2D } from "./Shader";

export class FlatShader extends Shader2D
{
    colour: Vector4;
    constructor(gl: WebGL2RenderingContext, r: number, g: number, b: number, a: number)
    {
        super(gl);
    }

    use(gl: WebGL2RenderingContext, callback: () => void): void
    {
        if (!this.defaults(gl)) { return; }
        callback();
    }

    static create(gl: WebGL2RenderingContext): FlatShader
    {
        let shader = new FlatShader(gl, 0, 0, 0, 1);
        shader.fromFiles(gl, "FlatShader")
        return shader;
    }

}