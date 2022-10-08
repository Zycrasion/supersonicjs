import { Vector } from "../Transform/Vector";
import { ParserUtilities } from "./ParserUtilities";

export interface MeshData
{
    vertices: Vector[];
    indices: number[];
    normals: Vector[];
    normalIndices: number[];
    textures: Vector[];
    name : string;
}

export class ObjParser
{
    static parseOne(text: string): MeshData
    {
        let results: MeshData = {name : "Object", vertices: [], indices: [], normals: [], normalIndices: [], textures: [] };
        let objectCount = 0;
        let lines = text.split("\n");

        let vertices: Vector[];
        let normals: Vector[];
        let textures: Vector[];
        vertices = [];
        normals = [];
        textures = [];

        loop:
        for (let line of lines)
        {
            // Line starts as
            // v <- Vertex
            // vn <- Vertex Normal
            // vt <- UV Coordinates
            // f <- face definitions

            let characters = line.split(" ");
            switch (characters[0])
            {

                case "o":
                    if (objectCount>0)
                    {
                        break loop;
                    }
                    results.name = characters[1];
                    objectCount++;
                    break;

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
                        face =>
                        {
                            return face.split("/");
                        }
                    )
                    for (let i = 0; i < faceSplit.length; i++)
                    {
                        const face = faceSplit[i];
                        let vertexIndex = parseFloat(face[0]) - 1;
                        let textureIndex = parseFloat(face[1]) - 1;
                        let normalIndex = parseFloat(face[2]) - 1;

                        // results.normalIndices.push(normalIndex);
                        // results.indices.push(vertexIndex);
                        results.indices.push(
                            results.vertices.push(vertices[vertexIndex]) - 1
                        )
                        results.normals.push(normals[normalIndex]);
                        results.textures.push(textures[textureIndex]);
                    }
                    break;
            }
        }
        return results;
    }

    static parseAll(text : string) : MeshData[]
    {
        function createMeshData(name : string) : MeshData
        {
            return { name, vertices: [], indices: [], normals: [], normalIndices: [], textures: [] }
        }
        let results: MeshData[] = [];
        let lines = text.split("\n");

        let vertices: Vector[];
        let normals: Vector[];
        let textures: Vector[];
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
            switch (characters[0])
            {

                case "o":
                    // o name
                    let name = characters[1];
                    results.push(createMeshData(name));
                    break;

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
                        face =>
                        {
                            return face.split("/");
                        }
                    )
                    for (let i = 0; i < faceSplit.length; i++)
                    {
                        const face = faceSplit[i];
                        let vertexIndex = parseFloat(face[0]) - 1;
                        let textureIndex = parseFloat(face[1]) - 1;
                        let normalIndex = parseFloat(face[2]) - 1;

                        // results.normalIndices.push(normalIndex);
                        // results.indices.push(vertexIndex);
                        results[results.length-1].indices.push(
                            results[results.length-1].vertices.push(vertices[vertexIndex]) - 1
                        )
                        results[results.length-1].normals.push(normals[normalIndex]);
                        results[results.length-1].textures.push(textures[textureIndex]);
                    }
                    break;
            }
        }
        return results;
    }

    static parseVector(characters: string[]): Vector
    {
        let vert = new Vector();
        let _ = ParserUtilities.ToNextNumber(characters);
        vert.x = _.num;

        _ = ParserUtilities.ToNextNumber(characters, _.index);
        vert.y = _.num;

        _ = ParserUtilities.ToNextNumber(characters, _.index);
        vert.z = _.num;
        return vert;
    }
}