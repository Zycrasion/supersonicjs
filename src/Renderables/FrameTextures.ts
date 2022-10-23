import { ITexture } from "./Texture";

interface FrameTextureOptions
{
    attachment?: number;
    filtering? : number;
    internalFormat? : number;
    format? : number;
    storage? : number;
}
export class FrameTexture implements ITexture
{

    private framebuffer: WebGLFramebuffer;
    private texture: WebGLTexture;
    private renderBuffer: WebGLRenderbuffer;

    private width: number;
    private height: number;

    origWidth: number;
    origHeight: number;

    get FBOWidth()
    {
        return this.width
    }

    get FBOHeight()
    {
        return this.height;
    }

    get FrameBuffer()
    {
        return this.framebuffer;
    }

    get Texture()
    {
        return this.texture;
    }

    bindFrameBuffer(gl: WebGL2RenderingContext)
    {
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    unbindFrameBuffer(gl: WebGL2RenderingContext)
    {
        gl.viewport(0, 0, this.origWidth, this.origHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    bind(gl: WebGL2RenderingContext, SLOT: number)
    {
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
        {
            this.unbindFrameBuffer(gl);
            return;
        }
        this.unbindFrameBuffer(gl);
        gl.activeTexture(SLOT);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    static create(gl: WebGL2RenderingContext, width: number, height: number, options: FrameTextureOptions = {}): FrameTexture
    {
        options.attachment = options.attachment || gl.COLOR_ATTACHMENT0;
        options.filtering = options.filtering || gl.LINEAR;
        options.internalFormat = options.internalFormat || gl.RGB;
        options.format = options.format || gl.RGB;
        options.storage = options.storage || gl.UNSIGNED_BYTE;

        let frame = new FrameTexture();
        frame.width = width;
        frame.height = height;

        frame.origWidth = gl.canvas.clientWidth;
        frame.origHeight = gl.canvas.clientHeight;

        frame.framebuffer = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);

        frame.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, frame.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, width, height, 0, options.format, options.storage, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.filtering);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.filtering);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, options.attachment, gl.TEXTURE_2D, frame.texture, 0);

        frame.renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, frame.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH32F_STENCIL8, width, height);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, frame.renderBuffer);
        frame.unbindFrameBuffer(gl);


        return frame;
    }

    delete(gl: WebGL2RenderingContext)
    {
        gl.deleteFramebuffer(this.framebuffer);
        gl.deleteTexture(this.texture);
    }

}