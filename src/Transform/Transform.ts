import { mat4, quat, vec3 } from "gl-matrix";
import { vec, Vector } from "./Vector";
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

    get lookAt()
    {
        let mat = this.generateMat4();
        return vec(mat[2], mat[6], mat[10]).normalize();
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
        let matrix = mat4.fromRotationTranslationScale(
            mat4.create(),
            quat.fromEuler(quat.create(), this.rotation.x, this.rotation.y,this.rotation.z),
            this.position.toFloat32Array(),
            this.scale.toFloat32Array()
        )
        return matrix
    }

    generateMat4Camera()
    {
        let matrix = mat4.create();
        mat4.rotate(matrix, matrix, this.rotation.x, [1,0,0]);
        mat4.rotate(matrix, matrix, this.rotation.y, [0,1,0]);
        mat4.rotate(matrix, matrix, this.rotation.z, [0,0,1]);

        mat4.translate(matrix, matrix, this.position.toFloat32Array());
        mat4.scale(matrix,matrix, this.scale.toFloat32Array());

        return matrix;
    }

}