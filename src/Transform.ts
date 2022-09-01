import { mat4 } from "gl-matrix";
import { Vector } from "./Vector";

export class Transform
{
    position : Vector;
    rotation : Vector;
    scale : Vector;

    constructor()
    {
        this.position = new Vector();
        this.rotation = new Vector();
        this.scale = new Vector();
        this.scale.set(1);
    }

    generateMat4() : mat4
    {
        let matrix = mat4.create();
        mat4.translate(
            matrix,
            matrix,
            this.position.toFloat32Array()
        );
        let axis = this.rotation.toArray();
        for (let i=0;i<3;i++)
        {
            let currAxis = [0,0,0];
            currAxis[i] = 1;
            mat4.rotate(
                matrix,
                matrix,
                axis[i],
                new Float32Array(currAxis)
            )
        }

        mat4.scale(
            matrix,
            matrix,
            this.scale.toFloat32Array()
        )

        return matrix
    }

}