export class BufferSonic
{

    data: BufferSource;
    length: number;
    buffer: WebGLBuffer;
    type: number;
    usage: number;

    constructor(gl: WebGL2RenderingContext, data: BufferSource, length: number, type = gl.ARRAY_BUFFER, usage = gl.STATIC_DRAW)   
    {
        this.data = data;
        this.length = length;
        this.type = type;
        this.usage = usage;

        this.buffer = gl.createBuffer();
        gl.bindBuffer(this.type, this.buffer);
        gl.bufferData(this.type, data, this.usage);
    }

    bind(gl: WebGL2RenderingContext)
    {
        gl.bindBuffer(this.type, this.buffer);
    }

    changeData(gl: WebGL2RenderingContext, data: BufferSource, length : number)
    {
        this.data = data;
        this.length = length;
        this.bind(gl);
        gl.bufferSubData(this.type, 0, data);
    }
}