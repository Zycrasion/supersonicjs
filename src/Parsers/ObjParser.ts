import { Vector } from "../Transform/Vector";
import { ParserUtilities } from "./ParserUtilities";

interface ObjParserResults
{
    vertices : Vector[];
    indices : number[];
    normals : Vector[];
    normalIndices : number[];
    textures : Vector[];
}

export class ObjParser
{
    static parse(text : string) : ObjParserResults
    {
        let results : ObjParserResults = {vertices:[],indices:[],normals:[],normalIndices:[],textures:[]};
        let lines = text.split("\n");

        let vertices : Vector[];
        let normals : Vector[];
        let textures : Vector[];
        vertices = [];
        normals = [];
        textures = [];

        for (let line of lines)
        {
            // Line starts as
            // v <- Vertex
            // vn <- Vertex Normal
            // vt <- UV Coordinates
            // f <- face definitions

            let characters = line.split(" ");
            switch(characters[0])
            {
                case "v":
                    // v 0.89765 1 12312342 [1]
                    vertices.push(ObjParser.parseVector(characters));
                    break;

                case "vn":
                    normals.push(ObjParser.parseVector(characters));
                    break;
                
                case "vt":
                    textures.push(ObjParser.parseVector(characters))
                    break;
                
                // f [index]/[texIndex]/[normalIndex]
                case "f":
                    characters.shift();
                    let faceSplit = characters.map(
                        face => {
                            return face.split("/");
                        }
                    )
                    for (let i = 0; i < faceSplit.length; i++) {
                        const face = faceSplit[i];
                        let vertexIndex = parseFloat(face[0])-1;
                        let textureIndex = parseFloat(face[1])-1;
                        let normalIndex = parseFloat(face[2])-1;

                        // results.normalIndices.push(normalIndex);
                        // results.indices.push(vertexIndex);
                        results.indices.push(
                            results.vertices.push(vertices[vertexIndex])-1
                        )
                        results.normals.push(normals[normalIndex]);
                        results.textures.push(textures[textureIndex]);
                    }
                    break;
            }
        }
        console.log(results)
        return results;
    }

    static parseVector(characters : string[]) : Vector
    {
        let vert = new Vector();
        let _ = ParserUtilities.ToNextNumber(characters);
        vert.x = _.num;

        _ = ParserUtilities.ToNextNumber(characters,_.index);
        vert.y = _.num;

        _ = ParserUtilities.ToNextNumber(characters, _.index);
        vert.z = _.num;
        return vert;
    }
}