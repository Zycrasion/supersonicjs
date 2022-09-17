import { mat4 } from "gl-matrix";
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

    enableVertexAttrib(gl: WebGL2RenderingContext, loc: number, size = 3, type = gl.FLOAT, normalize = false, stride = 0, offset = 0)
    {
        gl.vertexAttribPointer(
            loc,
            size,
            type,
            normalize,
            stride,
            offset
        );

        gl.enableVertexAttribArray(loc);
    }

    createBuffer(gl: WebGL2RenderingContext, data: Float32Array | Uint16Array, type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW)
    {
        let buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, usage);
        return buffer;
    }
}

export class GeometryRenderable2D extends RenderableAbstract
{
    vertices: number[];
    verticesBuffer: WebGLBuffer;
    vertexLength: number;
    projectionMatrix: mat4;
    static Name = "GeometryRenderable2D";

    constructor(gl: WebGL2RenderingContext, vertices: number[], shader: Shader, projectionMatrix: mat4 = ProjectionMatrix.orthographic(gl))
    {
        super(shader, GeometryRenderable2D.Name);
        this.vertices = vertices;
        this.vertexLength = vertices.length / 2;
        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        this.projectionMatrix = projectionMatrix;
    }

    draw_tick(gl: WebGL2RenderingContext): void
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

export class GeometryRenderable3D extends RenderableAbstract
{
    vertices: number[];
    verticesBuffer: WebGLBuffer;
    vertexLength: number;

    elements: number[];
    elementsBuffer: WebGLBuffer;
    elementLength: number;

    normals: number[];
    normalBuffer: WebGLBuffer;
    normalLength: number;

    textureBuffer: WebGLBuffer;

    vao: WebGLVertexArrayObject;

    static Name = "GeometryRenderable3D";

    constructor(gl: WebGL2RenderingContext, vertices: number[], elements: number[], normals: Vector[], textures: Vector[], shader: Shader, projectionMatrix: mat4 = ProjectionMatrix.orthographic(gl))
    {
        super(shader, GeometryRenderable3D.Name);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vertices = vertices;
        this.vertexLength = vertices.length / 3;
        this.verticesBuffer = this.createBuffer(gl, new Float32Array(this.vertices));

        this.elements = elements;
        this.elementLength = elements.length;
        this.elementsBuffer = this.createBuffer(gl, new Uint16Array(elements), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW)
        this.enableVertexAttrib(gl, 0);

        let normalsUnpacked = Vector.unpackVertices(normals);
        this.normalBuffer = this.createBuffer(gl, new Float32Array(normalsUnpacked));
        this.enableVertexAttrib(gl, 1);

        let texturesUnpacked = Vector.unpackVertices(textures);
        this.textureBuffer = this.createBuffer(gl, new Float32Array(texturesUnpacked));
        this.enableVertexAttrib(gl, 2)
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

            gl.bindVertexArray(this.vao);


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

            gl.drawElements(gl.TRIANGLES, this.elementLength, gl.UNSIGNED_SHORT, 0);
        });
    }
}