import { mat4 } from "gl-matrix";
import { BufferSonic } from "../Abstraction/Buffer";
import { VertexArray } from "../Abstraction/VAO";
import { CameraLike, Camera } from "../Camera";
import { Component } from "../EntityComponentSystem/Component";
import { Entity } from "../EntityComponentSystem/Entity";
import { Scene } from "../EntityComponentSystem/Scene";
import { MeshData } from "../Parsers/ObjParser";
import { Shader3D } from "../Shaders/3DShader";
import { BaseMaterial } from "../Shaders/Material";
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

export class GeometryRenderableLite extends Component
{
    parent: GeometryRenderable;
    material: BaseMaterial;

    constructor(parent: GeometryRenderable, mat: BaseMaterial)
    {
        super("GeometryRenederableLite")
        this.parent = parent;
        this.material = mat;
    }

    draw_tick(gl: WebGL2RenderingContext, scene : Scene, shaderParamCallback = () => { })
    {
        this.parent.shader.useMaterial(gl, this.material);
        this.parent.shader.useLight(gl, scene.light);
        this.parent.parent_ptr = this.parent_ptr;
        this.parent.draw_tick(gl, scene, shaderParamCallback);
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

    constructor(gl: WebGL2RenderingContext, Mesh: MeshData, shader: Shader3D)
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

    with(material: BaseMaterial): GeometryRenderableLite
    {
        return new GeometryRenderableLite(this, material);
    }

    replaceMesh(gl: WebGL2RenderingContext, Mesh: MeshData)
    {
        let verticesUnpacked = new Float32Array(Vector.unpackVertices(Mesh.vertices))
        this.vertices.changeData(gl, verticesUnpacked, Mesh.vertices.length);
        this.indices.changeData(gl, new Uint32Array(Mesh.indices), Mesh.indices.length);

        let normalsUnpacked = new Float32Array(Vector.unpackVertices(Mesh.normals));
        this.normals.changeData(gl, normalsUnpacked, Mesh.normals.length);

        let texturesUnpacked = new Float32Array(Vector.unpackVertices(Mesh.textures));
        this.textureBuffer.changeData(gl, texturesUnpacked, Mesh.textures.length);

    }

    draw_tick(gl: WebGL2RenderingContext, scene : Scene, shaderParamCallback = () => { }): void
    {
        let Camera = scene.MainCamera;
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