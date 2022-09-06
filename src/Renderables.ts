import { mat4 } from "gl-matrix";
import { Shader } from "./Shaders/Shader";
import { Transform } from "./Transform";
import { ProjectionMatrix } from "./utilities";

export class RenderableAbstract
{
    transform : Transform;
    shader : Shader;
    constructor(shader : Shader) {this.transform = new Transform(); this.shader = shader};
    draw(gl : WebGLRenderingContext) : void {};
}

export class GeometryRenderable2D extends RenderableAbstract
{
    vertices : number[];
    verticesBuffer : WebGLBuffer;
    vertexLength : number;

    constructor(gl : WebGLRenderingContext, vertices : number[], shader : Shader)
    {
        super(shader);
        this.vertices = vertices;
        this.vertexLength = vertices.length/2;
        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    draw(gl: WebGLRenderingContext, projectionMatrix = ProjectionMatrix.orthographic(gl)): void {
        this.shader.use(gl, () => {
            let matrix = this.transform.generateMat4();
            this.shader.enableVertexAttrib(gl, this.verticesBuffer);
            this.shader.setShaderUniform_mat4fv(
                gl,
                "uProjectionMatrix",
                projectionMatrix
            );
            
            this.shader.setShaderUniform_mat4fv(
                gl,
                "uModelViewMatrix",
                matrix
            );
    
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexLength);
        });   
    }
}