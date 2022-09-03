import { Math2, UV } from "../utilities";
import { Shader } from "./Shader";

export class ImageShader extends Shader
{
    texture : WebGLTexture;
    textureCoordinates : WebGLBuffer;
    constructor(gl : WebGLRenderingContext, imageSrc : string, uvcoordinates : WebGLBuffer = UV.DefaultSquare(gl), FILTERING : number = gl.NEAREST)
    {
        super(gl,`
            attribute vec4 aVertexPosition;
            attribute vec2 aTextureCoord;
        
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
        
            varying highp vec2 vTextureCoord;
        
            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;
            }
        `,`
            varying highp vec2 vTextureCoord;

            uniform sampler2D uSampler;
        
            void main(void) {
            gl_FragColor = texture2D(uSampler, vTextureCoord);
            }
        `);

        this.textureCoordinates = uvcoordinates;

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        

        // Put a single pixel in the image so we can use it before the image has been downloaded over the internet
        const level = 0;
        const imageFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([
            255,0,125,255 // Opaque Pink
        ]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            imageFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        // Load the image
        const image = new Image();
        image.onload = (ev : Event) =>
        {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                imageFormat,
                srcFormat,
                srcType,
                image
            );

            gl.texParameteri(
                gl.TEXTURE_2D,
                gl.TEXTURE_MIN_FILTER,
                FILTERING
            )

            if (Math2.isPowerOf2(image.width))
            {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_S,
                    gl.CLAMP_TO_EDGE
                )

                gl.texParameteri(
                    gl.TEXTURE_2D,
                    gl.TEXTURE_WRAP_T,
                    gl.CLAMP_TO_EDGE
                )
            }

        }

        // Start Loading Process
        image.src = imageSrc;
    }   

    use(gl: WebGLRenderingContext): void {
        gl.useProgram(this.ShaderProgram);
        this.enableVertexAttrib(
            gl,
            this.textureCoordinates,
            "aTextureCoord"
        );
        gl.activeTexture(gl.TEXTURE0);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // 0 for gl.TEXTURE0
        this.setShaderUniform_1i(gl, "uSampler", 0);
    }
}