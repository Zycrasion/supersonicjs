import { mat4 } from "gl-matrix";
import { BufferSonic } from "../Abstraction/Buffer";
import { VertexArray } from "../Abstraction/VAO";
import { CameraLike, Camera } from "../Camera";
import { Component } from "../EntityComponentSystem/Component";
import { Entity } from "../EntityComponentSystem/Entity";
import { MeshData } from "../Parsers/ObjParser";
import { Shader3D } from "../Shaders/3DShader";
import { Shader, Shader2D } from "../Shaders/Shader";
import { Transform, TransformLike } from "../Transform/Transform";
import { Vector } from "../Transform/Vector";
import { ProjectionMatrix } from "../utilities";

export abstract class RenderableAbstract extends Component
{
    transform: Transform;
    abstract shader: Shader;
    constructor(name?: string) { super(name); this.parent_ptr = null; this.transform = new Transform(); };
    attach(parent: Entity): void
    {
        this.parent_ptr = parent;
    }
}

/**
 * @deprecated
 */
export class GeometryRenderable2D extends RenderableAbstract
{
    vertices: BufferSonic;

    vao : VertexArray;

    shader : Shader2D;

    static Name = "GeometryRenderable2D";

    constructor(gl: WebGL2RenderingContext, Mesh : MeshData,  shader: Shader2D)
    {
        super(GeometryRenderable2D.Name);
        this.shader = shader;
        this.vao = new VertexArray(gl);
        this.vao.bind(gl);
        this.vertices = new BufferSonic(gl, new Float32Array(Vector.unpackVertices(Mesh.vertices)), Mesh.vertices.length);
        this.vao.enableVertexAttrib(gl, 0);
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: CameraLike): void
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

            this.shader.setShaderUniform_mat4fv(
                gl,
                "uViewMatrix",
                Camera.getTransformation()
            )

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertices.length);
        });
    }

}

export class GeometryRenderable extends RenderableAbstract
{
    vertices: BufferSonic;

    indices: BufferSonic;

    normals: BufferSonic;

    textureBuffer: BufferSonic;

    vao: VertexArray;

    shader: Shader3D;

    static Name = "GeometryRenderable3D";

    constructor(gl: WebGL2RenderingContext, Mesh : MeshData, shader: Shader3D)
    {
        super(GeometryRenderable.Name);
        this.shader = shader;
        this.vao = new VertexArray(gl);

        let verticesUnpacked = Vector.unpackVertices(Mesh.vertices)
        this.vertices = new BufferSonic(gl, new Float32Array(verticesUnpacked), Mesh.vertices.length / 3);

        this.indices = new BufferSonic(gl, new Uint32Array(Mesh.indices), Mesh.indices.length, gl.ELEMENT_ARRAY_BUFFER);
        this.vao.enableVertexAttrib(gl, 0);

        let normalsUnpacked = Vector.unpackVertices(Mesh.normals);
        this.normals = new BufferSonic(gl, new Float32Array(normalsUnpacked), normalsUnpacked.length / 3);
        this.vao.enableVertexAttrib(gl, 1);

        if (Mesh.textures == undefined)
        {
            console.error("UV Coordintates not included!");
        } else 
        {
            let texturesUnpacked = Vector.unpackVertices(Mesh.textures);
            this.textureBuffer = new BufferSonic(gl, new Float32Array(texturesUnpacked), texturesUnpacked.length / 3);
            this.textureBuffer.bind(gl);
            this.vao.enableVertexAttrib(gl, 2, 3);
        }
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: CameraLike, shaderParamCallback = () => { }): void
    {
        this.shader.setViewMatrix(Camera.getTransformation());
        this.shader.setViewPos(Camera.getPosition().toVector3())
        this.shader.setProjectionMatrix(Camera.generateProjection(gl))
        let matrix: mat4;
        if (this.parent_ptr != null)
        {
            matrix = Transform.Combine(this.parent_ptr.transform, this.transform)
        } else
        {
            matrix = this.transform.generateMat4();
        }
        this.shader.setModelViewMatrix(matrix);
        this.shader.updateUniforms(gl);

        this.shader.use(gl, () =>
        {
            this.vao.bind(gl);

            shaderParamCallback();

            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        });
    }
}