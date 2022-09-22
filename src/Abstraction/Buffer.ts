export class BufferSonic
{

    data: BufferSource;
    length: number;
    buffer: WebGLBuffer;
    type : number;

    constructor(gl: WebGL2RenderingContext, data: BufferSource, length: number, type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW)   
    {
        this.data = data;
        this.length = length;
        this.type = type;

        this.buffer = gl.createBuffer();
        gl.bindBuffer(this.type, this.buffer);
        gl.bufferData(this.type, data, usage);
    }

    bind(gl : WebGL2RenderingContext)
    {
        gl.bindBuffer(this.type, this.buffer);
    }
}