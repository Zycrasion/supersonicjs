import { mat4, quat, vec3 } from "gl-matrix";
import { Vector } from "./Vector";
export interface TransformLike 
{
    generateMat4() :mat4
}
export class Transform implements TransformLike
{
    position: Vector;
    rotation: Vector;
    scale: Vector;

    overrideMatrix : mat4;

    constructor()
    {
        this.position = new Vector();
        this.rotation = new Vector();
        this.scale = new Vector();
        this.scale.set(1);
    }

    static Combine(parent: Transform, child: Transform): mat4
    {
        let matrix = mat4.create();
        
        let childMat = child.generateMat4();
        let parentMat = parent.generateMat4();
        
        mat4.multiply(matrix,parentMat,childMat);
        return matrix;
    }

    copy()
    {
        let t = new Transform();
        t.position = this.position.copy();
        t.rotation = this.rotation.copy();
        t.scale = this.scale.copy();
        return t;
    }

    compare(transform: Transform)
    {
        return transform.position.compare(this.position) && transform.rotation.compare(this.rotation) && transform.scale.compare(this.scale);
    }

    generateMat4(): mat4
    {
        if (this.overrideMatrix!= null)
        {
            return this.overrideMatrix;
        }
        let matrix = mat4.create();
        let axis = this.rotation.toArray();
        for (let i = 0; i < 3; i++)
        {
            let currAxis = [0, 0, 0];
            currAxis[i] = 1;
            mat4.rotate(
                matrix,
                matrix,
                axis[i],
                new Float32Array(currAxis)
            )
        }

        mat4.translate(
            matrix,
            matrix,
            this.position.toFloatArray()
        );

        mat4.scale(
            matrix,
            matrix,
            this.scale.toFloatArray()
        )

        return matrix
    }

}