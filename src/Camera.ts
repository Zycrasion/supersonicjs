import { glMatrix, mat3, mat4 } from "gl-matrix";
import { Entity } from "./EntityComponentSystem/Entity";
import { InputAxis } from "./InputManager/Input";
import { Vector } from "./Transform/Vector";

export enum ProjectionType
{
    ORTHOGRAPHIC,
    PERSPECTIVE
}

export class Camera extends Entity
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
        this.fov = fov * Math.PI / 180;
        this.transform.position = position.copy();
    }

    setFov(fov: number)
    {
        this.fov = fov * Math.PI / 180;
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
                this.fov,
                gl.canvas.clientWidth / gl.canvas.clientHeight,
                this.near, this.far)
        }
        return proj;
    }

    freelook_binded_mousemove : () => void;
    freelook_mousemove(event : MouseEvent)
    {
        this.mouseX = event.movementX;
        this.mouseY = event.movementY;
        console.log(this.mouseX)
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
        // document.onmousemove = (event) =>
        // {
        //     var eventDoc, doc, body;
        //     var pageX, pageY;
        //     event = event || window.event as MouseEvent; // IE-ism

        //     // If pageX/Y aren't available and clientX/Y are,
        //     // calculate pageX/Y - logic taken from jQuery.
        //     // (This is to support old IE)
        //     if (event.pageX == null && event.clientX != null)
        //     {
        //         eventDoc = (event.target && event.target["ownerDocument"]) || document;
        //         doc = eventDoc.documentElement;
        //         body = eventDoc.body;

        //         pageX = event.clientX +
        //             (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        //             (doc && doc.clientLeft || body && body.clientLeft || 0);
        //         pageY = event.clientY +
        //             (doc && doc.scrollTop || body && body.scrollTop || 0) -
        //             (doc && doc.clientTop || body && body.clientTop || 0);
        //     } else
        //     {
        //         pageX = event.pageX;
        //         pageY = event.pageY;
        //     }

        //     this.mouseX = event.pageX + 500;
        //     this.mouseY = event.pageY + 500;
        // }


        // document.onmousedown = (event: MouseEvent) =>
        // {
        //     this.mouseStartX = this.mouseX;
        //     this.mouseStartY = this.mouseY;
        //     this.mouseDown = true;
        // }


        // document.onmouseup = (event: MouseEvent) =>
        // {
        //     this.mouseDown = false;
        // }
    }

    freecam(axis: InputAxis)
    {
        let mat = this.getTransformation();
        let lookAtVector = new Vector(mat[2], mat[6], mat[10]).normalize();
        this.transform.rotation.y += (this.mouseX) / 500;
        this.transform.rotation.x += (this.mouseY) / 500;
        this.mouseX = 0;
        this.mouseY = 0;
        let input = axis.getAxis();
        let movement = lookAtVector.copy();
        movement.mult(input.y * this.speed);
        this.transform.position.add(movement);
    }

}