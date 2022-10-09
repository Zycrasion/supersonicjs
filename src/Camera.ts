import { glMatrix, mat3, mat4 } from "gl-matrix";
import { Entity } from "./EntityComponentSystem/Entity";
import { IInputAxis, InputAxis } from "./InputManager/Input";
import { vec, Vector } from "./Transform/Vector";

export enum ProjectionType
{
    ORTHOGRAPHIC,
    PERSPECTIVE
}

export interface CameraLike
{
    generateProjection(gl : WebGL2RenderingContext)
    getTransformation()
}

export class Camera extends Entity implements CameraLike 
{
    projection: ProjectionType; fov: number;


    near = 0.1;
    far = 100;
    speed = 0.1;

    static Name = "Camera";

    mouseDown: boolean; mouseX = 0; mouseY = 0; mouseStartX: number; mouseStartY: number;

    constructor(projection = ProjectionType.PERSPECTIVE, fov = 45, position = Vector.ZERO)
    {
        super(Camera.Name);
        this.projection = projection;
        this.fov = fov;
        this.transform.position = position.copy();
    }

    setFov(fov: number)
    {
        this.fov = fov;
    }

    generateProjection(gl: WebGL2RenderingContext)
    {

        let proj = mat4.create();
        if (this.projection == ProjectionType.ORTHOGRAPHIC)
        {
            let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            mat4.ortho(proj,
                -aspect / 2, aspect / 2,
                -1 / 2, 1 / 2,
                this.near, this.far);
        } else
        {
            mat4.perspective(proj,
                this.fov * Math.PI / 180,
                gl.canvas.clientWidth / gl.canvas.clientHeight,
                this.near, this.far)
        }
        return proj;
    }

    freelook_binded_mousemove: () => void;
    freelook_mousemove(event: MouseEvent)
    {
        this.mouseX = event.movementX;
        this.mouseY = event.movementY;
    }

    unhook_freelook()
    {
        document.removeEventListener("mousemove", this.freelook_binded_mousemove);
        this.freelook_binded_mousemove = null;
    }

    hook_freelook()
    {
        this.freelook_binded_mousemove = this.freelook_mousemove.bind(this);
        document.addEventListener("mousemove", this.freelook_binded_mousemove, false)
    }

    freecam(axis: IInputAxis)
    {
        this.transform.rotation.y += (this.mouseX) / 500;
        this.transform.rotation.x += (this.mouseY) / 500;
        this.mouseX = 0;
        this.mouseY = 0;

        let mat = this.getTransformation();
        let lookAtVector = new Vector(mat[2], mat[6], mat[10]).normalize();
        let input = axis.getAxis();
        let movement = lookAtVector.copy();
        movement.mult(input.y * this.speed);
        this.transform.position.add(movement);
    }

}