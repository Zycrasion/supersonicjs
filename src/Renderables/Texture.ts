import { resolve } from "path";
import { BufferSonic } from "../Abstraction/Buffer";
import { Loader } from "../Loader/Loader";
import { Math2, UV } from "../utilities";

export interface ITexture
{

    bind(gl: WebGL2RenderingContext, SLOT: number)
}
export class Texture 
{
    texture: WebGLTexture;

    bind(gl: WebGL2RenderingContext, SLOT = gl.TEXTURE0)
    {
        gl.activeTexture(SLOT);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
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

    protected init(gl: WebGL2RenderingContext, image: HTMLImageElement, FILTERING = gl.NEAREST, level = 0, imageFormat = gl.RGBA, srcFormat = gl.RGBA, srcType = gl.UNSIGNED_BYTE)
    {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
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

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            FILTERING
        )



        gl.generateMipmap(gl.TEXTURE_2D);


    }

    static load(gl: WebGL2RenderingContext, imageSrc: string, FILTERING: number = gl.NEAREST)
    {
        let texture = new Texture();
        texture.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);


        // Put a single pixel in the image so we can use it before the image has been downloaded over the internet
        const level = 0;
        const imageFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([
            255, 0, 125, 255 // Opaque Pink
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


        // Check if image is cached
        let response = Loader.LoadImage(imageSrc);
        if (typeof response != "string")
        {
            // Image is cached
            const image: HTMLImageElement = response;
            return new Promise<Texture>(resolve =>
            {
                texture.init(gl, image, FILTERING, level, imageFormat, srcFormat, srcType);
                resolve(texture);
            })
        }

        // Load the image
        const image = new Image();
        return new Promise<Texture>(resolve =>
        {
            image.onload = (ev: Event) =>
            {
                texture.init(gl, image, FILTERING, level, imageFormat, srcFormat, srcType);
                resolve(texture);
            }

            // Start Loading Process
            image.src = imageSrc;
        })

    }
}