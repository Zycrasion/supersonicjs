import { ITexture } from "./Texture";

export class FrameTexture implements ITexture
{

    private framebuffer: WebGLFramebuffer;
    private texture: WebGLTexture;
    private renderBuffer : WebGLRenderbuffer;

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
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    unbindFrameBuffer(gl : WebGL2RenderingContext)
    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    bind(gl: WebGL2RenderingContext, SLOT: number)
    {
        this.unbindFrameBuffer(gl);
        gl.activeTexture(SLOT);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    static create(gl: WebGL2RenderingContext, width : number, height : number) : FrameTexture
    {
        let frame = new FrameTexture();
        frame.framebuffer = gl.createFramebuffer();
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, frame.framebuffer);

        frame.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, frame.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frame.texture, 0);
        
        frame.renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, frame.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, frame.renderBuffer);



        return frame;
    }

    delete(gl : WebGL2RenderingContext)
    {
        gl.deleteFramebuffer(this.framebuffer);
        gl.deleteTexture(this.texture);
    }

}