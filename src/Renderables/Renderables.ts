import { mat4 } from "gl-matrix";
import { BufferSonic } from "../Abstraction/Buffer";
import { VertexArray } from "../Abstraction/VAO";
import { Camera } from "../Camera";
import { Component } from "../EntityComponentSystem/Component";
import { Entity } from "../EntityComponentSystem/Entity";
import { Shader } from "../Shaders/Shader";
import { Transform } from "../Transform/Transform";
import { Vector } from "../Transform/Vector";
import { ProjectionMatrix } from "../utilities";

export class RenderableAbstract extends Component
{
    transform: Transform;
    shader: Shader;
    constructor(shader: Shader, name?: string) { super(name); this.parent_ptr = null; this.transform = new Transform(); this.shader = shader };
    attach(parent: Entity): void
    {
        this.parent_ptr = parent;
    }
}

export class GeometryRenderable2D extends RenderableAbstract
{
    vertices: number[];
    verticesBuffer: WebGLBuffer;
    vertexLength: number;
    static Name = "GeometryRenderable2D";

    constructor(gl: WebGL2RenderingContext, vertices: number[], shader: Shader)
    {
        super(shader, GeometryRenderable2D.Name);
        this.vertices = vertices;
        this.vertexLength = vertices.length / 2;
        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: Camera): void
    {
        this.shader.use(gl, () =>
        {
            let matrix: mat4;
            if (this.parent_ptr != null)
            {
                matrix = Transform.Combine(this.parent_ptr.transform, this.transform)
            } else
            {
                matrix = this.transform.generateMat4();
            }
            this.shader.enableVertexAttrib(gl, this.verticesBuffer);
            this.shader.setShaderUniform_mat4fv(
                gl,
                "uProjectionMatrix",
                Camera.generateProjection(gl)
            );

            this.shader.setShaderUniform_mat4fv(
                gl,
                "uModelViewMatrix",
                matrix
            );

            this.shader.setShaderUniform_mat4fv(
                gl,
                "uViewMatrix",
                Camera.getTransformation()
            )

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexLength);
        });
    }

}

export class GeometryRenderable3D extends RenderableAbstract
{
    vertices: BufferSonic;

    elements: BufferSonic;

    normals: BufferSonic;

    textureBuffer: BufferSonic;

    vao: VertexArray;

    static Name = "GeometryRenderable3D";

    constructor(gl: WebGL2RenderingContext, vertices: number[], elements: number[], normals: Vector[], textures: Vector[], shader: Shader, projectionMatrix: mat4 = ProjectionMatrix.orthographic(gl))
    {
        super(shader, GeometryRenderable3D.Name);

        this.vao = new VertexArray(gl);

        this.vertices = new BufferSonic(gl, new Float32Array(vertices), vertices.length / 3);

        this.elements = new BufferSonic(gl, new Uint16Array(elements), elements.length, gl.ELEMENT_ARRAY_BUFFER);
        this.vao.enableVertexAttrib(gl, 0);

        let normalsUnpacked = Vector.unpackVertices(normals);
        this.normals = new BufferSonic(gl, new Float32Array(normalsUnpacked), normalsUnpacked.length / 3);
        this.vao.enableVertexAttrib(gl, 1);

        let texturesUnpacked = Vector.unpackVertices(textures);
        this.textureBuffer = new BufferSonic(gl, new Float32Array(texturesUnpacked), texturesUnpacked.length/3)
        this.vao.enableVertexAttrib(gl, 2)
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: Camera, shaderParamCallback = () => { }): void
    {
        this.shader.use(gl, () =>
        {
            let matrix: mat4;
            if (this.parent_ptr != null)
            {
                matrix = Transform.Combine(this.parent_ptr.transform, this.transform)
            } else
            {
                matrix = this.transform.generateMat4();
            }

            this.vao.bind(gl);


            this.shader.setShaderUniform_mat4fv(
                gl,
                "uProjectionMatrix",
                Camera.generateProjection(gl)
            );

            this.shader.setShaderUniform_mat4fv(
                gl,
                "uModelViewMatrix",
                matrix
            );

            shaderParamCallback();

            gl.drawElements(gl.TRIANGLES, this.elements.length, gl.UNSIGNED_SHORT, 0);
        });
    }
}