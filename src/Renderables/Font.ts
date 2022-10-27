import { MeshData } from "../Parsers/ObjParser"
import { Flat3D } from "../Shaders/3DShader"
import { FlatShader } from "../Shaders/FlatShader"
import { vec } from "../Transform/Vector"
import { Dict } from "../utilities"
import { GeometryRenderable } from "./Renderables"
import { Texture } from "./Texture"



export interface FontInformation
{
    letterinfo:
    {
        letterHeight: number,
        letterWidth: number,
        spaceWidth: number,
        spacing: number
    },
    textureInfo:
    {
        width: number,
        height: number
    },
    atlas: Dict<{ x: number, y: number }>,
    texture: Texture
}

export class Font implements FontInformation
{
    letterinfo: { letterHeight: number; letterWidth: number; spaceWidth: number; spacing: number }
    textureInfo: { width: number; height: number }
    atlas: Dict<{ x: number; y: number }>
    texture: Texture

    constructor(information: FontInformation)
    {
        this.letterinfo = information.letterinfo;
        this.textureInfo = information.textureInfo;
        this.atlas = information.atlas;
        this.texture = information.texture;
    }

    createText(text: string): MeshData
    {
        let data: MeshData = {
            vertices: [],
            indices: [],
            normals: [],
            textures: [],
            name: ""
        }

        let lW = this.letterinfo.letterWidth;
        let lH = this.letterinfo.letterHeight;

        let nW = 1;
        let nH = lH / lW;

        let iW = this.textureInfo.width;
        let iH = this.textureInfo.height;

        let tW = text.length * nW;
        let tH = 1;

        let x = 0;
        let y = 0;
        let normal = vec(0, 0, 1);
        let letters = text.split("");
        let i = 0;
        for (let letter of letters)
        {
            let letterInfo = this.atlas[letter];

            if (letterInfo == undefined || letter == " ")
            {
                x += 1;
                continue;
            }

            let texX = letterInfo.x;
            let texY = letterInfo.y;
            let texPos = vec(texX / iW, texY / iH);
            let texSize = vec(lW / iW, lH / iH);
            /*
            v1 v2
            v3 v4
            */
            let v1 = vec(x - tW / 2, y - tH / 2);
            let v2 = vec(x + nW - tW / 2, y - tH / 2);
            let v3 = vec(x - tW / 2, y + nH - tH / 2);
            let v4 = vec(x + nW - tW / 2, y + nH - tH / 2);

            data.vertices.push(v1, v2, v3, v4);
            data.normals.push(normal, normal, normal, normal);
            data.textures.push(
                vec(texPos.x, texPos.y), vec(texPos.x + texSize.x, texPos.y),
                vec(texPos.x, texPos.y + texSize.y), vec(texPos.x + texSize.x, texPos.y + texSize.y)
            );
            // no quads gotta be tris
            data.indices.push(i, i + 1, i + 2, i + 2, i + 3, i + 1);

            i += 4;
            x += nW;
        }

        return data;
    }

}