import { MeshData } from "../../Parsers/ObjParser";
import { vec } from "../../Transform/Vector";

export function SquareVertices(): Array<number>
{
    return [1, 1, -1, 1, 1, -1, -1, -1];
}

export function SquareMesh(w: number, h: number): MeshData
{
    w /= 2;
    h /= 2;
    return {
        vertices: [
            vec(-w, h),
            vec(-w, -h),
            vec(w, h),
            vec(w, -h),
        ],
        indices: [
            0, 1, 2,
            2, 3, 1
        ],
        normals: [
            vec(0, 0, 1),
            vec(0, 0, 1),
            vec(0, 0, 1),
            vec(0, 0, 1),
        ],
        textures: [
            vec(0, 1),
            vec(0, 0),
            vec(1, 1),
            vec(1, 0)
        ],
        name: ""
    }
}