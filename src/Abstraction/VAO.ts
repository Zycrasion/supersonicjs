export class VertexArray
{
    vao : WebGLVertexArrayObject;

    constructor(gl : WebGL2RenderingContext)
    {
        this.vao = gl.createVertexArray();
        this.bind(gl);
    }

    bind(gl : WebGL2RenderingContext)
    {
        gl.bindVertexArray(this.vao);
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
}