import { mat3, mat4 } from "gl-matrix";
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
    projection : ProjectionType; fov : number;
    near = 0.1;
    far = 100;

    mouseDown : boolean; mouseX : number; mouseY : number; mouseStartX : number; mouseStartY : number;

    constructor(projection=ProjectionType.PERSPECTIVE, fov = 45, position=Vector.ZERO)
    {
        super("MainCamera");
        this.projection = projection;
        this.fov = fov * Math.PI / 180;
        this.transform.position = position.copy();
    }

    setFov(fov : number)
    {
        this.fov = fov * Math.PI / 180;
    }

    generateProjection(gl : WebGL2RenderingContext)
    {
        let proj = mat4.create();
        if (this.projection==ProjectionType.ORTHOGRAPHIC)
        {
            mat4.ortho(proj,
                -gl.canvas.clientWidth/2,gl.canvas.clientWidth/2,
                -gl.canvas.clientHeight/2,gl.canvas.clientHeight/2,
                this.near,this.far);
        } else {
            mat4.perspective(proj,
                this.fov,
                gl.canvas.clientWidth / gl.canvas.clientHeight,
                this.near,this.far)
        }
        return proj;
    }

    hookfreecam()
    {
        document.onmousemove = handleMouseMove.bind(this);
        function handleMouseMove(event) {
            var eventDoc, doc, body;

            event = event || window.event as MouseEvent; // IE-ism

            // If pageX/Y aren't available and clientX/Y are,
            // calculate pageX/Y - logic taken from jQuery.
            // (This is to support old IE)
            if (event.pageX == null && event.clientX != null) {
                eventDoc = (event.target && event.target.ownerDocument) || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                (doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
            }

            this.mouseX = event.pageX + 500;
            this.mouseY = event.pageY + 500;
        }
        document.onmousedown = mouseDown.bind(this); 
        function mouseDown(event : MouseEvent)
        {
            this.mouseStartX = this.mouseX;
            this.mouseStartY = this.mouseY;
            this.mouseDown = true;
        }
        document.onmouseup = mouseUp.bind(this);
        function mouseUp(event : MouseEvent)
        {
            this.mouseDown = false;
        }
    }

    freecam(axis : InputAxis)
    {   
        if (this.mouseDown==true)
        {
            this.transform.rotation.y += (this.mouseStartX-this.mouseX)/500;
            this.mouseStartX = this.mouseX;
            this.transform.rotation.x += (this.mouseStartY-this.mouseY)/500;
            this.mouseStartY = this.mouseY;
        }
        let dir = new Vector();
        dir.z = -Math.cos( this.transform.rotation.y - (Math.PI)) * axis.getAxis().y;
        dir.x = Math.sin( this.transform.rotation.y - (Math.PI)) * axis.getAxis().y;
        this.transform.position.add(dir);
    }

}