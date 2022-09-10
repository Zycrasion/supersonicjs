import { mat4 } from "gl-matrix";
import { Component } from "../EntityComponentSystem/Component";
import { Entity } from "../EntityComponentSystem/Entity";
import { Shader } from "../Shaders/Shader";
import { Transform } from "../Transform/Transform";
import { ProjectionMatrix } from "../utilities";

export class RenderableAbstract extends Component
{
    transform : Transform;
    shader : Shader;
    constructor(shader : Shader, name? : string) {super(name); this.parent_ptr = null; this.transform = new Transform(); this.shader = shader};
    attach(parent: Entity): void {
        this.parent_ptr = parent;
    }
}

export class GeometryRenderable2D extends RenderableAbstract
{
    vertices : number[];
    verticesBuffer : WebGLBuffer;
    vertexLength : number;
    projectionMatrix : mat4;
    static Name = "GeometryRenderable2D";

    constructor(gl : WebGL2RenderingContext, vertices : number[], shader : Shader, projectionMatrix : mat4 = ProjectionMatrix.orthographic(gl))
    {
        super(shader, GeometryRenderable2D.Name);
        this.vertices = vertices;
        this.vertexLength = vertices.length/2;
        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        this.projectionMatrix = projectionMatrix;
    }

    draw_tick(gl: WebGL2RenderingContext): void 
    {
        this.shader.use(gl, () => {
            let matrix : mat4;
            if (this.parent_ptr!=null)
            {
                matrix = Transform.Combine(this.parent_ptr.transform,this.transform)
            } else {
                matrix = this.transform.generateMat4();
            }
            this.shader.enableVertexAttrib(gl, this.verticesBuffer);
            this.shader.setShaderUniform_mat4fv(
                gl,
                "uProjectionMatrix",
                this.projectionMatrix
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