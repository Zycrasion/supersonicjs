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

export class GeometryRenderable3D extends RenderableAbstract
{
    vertices : number[];
    verticesBuffer : WebGLBuffer;
    vertexLength : number;

    elements : number[];
    elementsBuffer : WebGLBuffer;
    elementLength : number;

    vao : WebGLVertexArrayObject;

    projectionMatrix : mat4;
    static Name = "GeometryRenderable3D";

    constructor(gl : WebGL2RenderingContext, vertices : number[], elements : number[], shader : Shader, projectionMatrix : mat4 = ProjectionMatrix.orthographic(gl))
    {
        super(shader, GeometryRenderable3D.Name);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        this.vertices = vertices;
        this.vertexLength = vertices.length/3;

        this.verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        this.elements = elements;
        this.elementLength = elements.length;

        this.elementsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementsBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.elements), gl.STATIC_DRAW);

        { // Scope because we dont need any of the variables outside of this
            let size = 3;
            let type = gl.FLOAT;
            let normalize = false; // dont normalize (map values to 0-1)
            let stride = 4*3; // 0 use size and type above
            let offset = 0; 
            
            let vertexPositionLoc = 0
    
            gl.vertexAttribPointer(
                vertexPositionLoc,
                size,
                type,
                normalize,
                stride,
                offset
            );

            gl.enableVertexAttribArray(vertexPositionLoc);
        }


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

            gl.bindVertexArray(this.vao);

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

            
            gl.drawElements(gl.TRIANGLES , this.elementLength, gl.UNSIGNED_SHORT, 0);
        });   
    }
}