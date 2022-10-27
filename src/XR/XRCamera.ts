import { mat4 } from "gl-matrix";
import { CameraLike } from "../Camera";
import { vec, vec4, Vector4 } from "../Transform/Vector";

export class XRCamera implements CameraLike
{

    transformationMatrix: mat4;
    projectionMatrix: mat4;

    constructor(vrEye: XRView)
    {
        this.transformationMatrix = vrEye.transform.inverse.matrix;
        this.projectionMatrix = vrEye.projectionMatrix;
    }

    get lookAt()
    {
        let mat = this.transformationMatrix;
        return vec(mat[2], mat[6], mat[10]).normalize();
    }

    getPosition(): Vector4
    {
        return vec4(this.transformationMatrix[0], this.transformationMatrix[1], this.transformationMatrix[2], this.transformationMatrix[3])
    }

    generateProjection(gl: WebGL2RenderingContext)
    {
        return this.projectionMatrix
    }
    getTransformation()
    {
        return this.transformationMatrix;
    }
}