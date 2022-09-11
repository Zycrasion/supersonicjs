import { Vector } from "../Transform/Vector";
import { ParserUtilities } from "./ParserUtilities";

interface ObjParserResults
{
    vertices : Vector[];
    indices : number[];
    normals : Vector[];
    normalIndices : number[];
}

export class ObjParser
{
    static parse(text : string) : ObjParserResults
    {
        let results : ObjParserResults = {vertices:[],indices:[],normals:[],normalIndices:[]};
        let lines = text.split("\n");
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
                    results.vertices.push(ObjParser.parseVector(characters));
                    break;

                case "vn":
                    results.normals.push(ObjParser.parseVector(characters));
                    break;
                
                case "vt":
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
                        let index = parseFloat(face[0])-1;
                        let textureIndex = parseFloat(face[1])-1;
                        let normalIndex = parseFloat(face[2])-1;

                        results.normalIndices.push(normalIndex);
                        results.indices.push(index);
                    }
                    results.indices.push()
                    break;
            }
        }
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