import { mat4 } from "gl-matrix";
import { CameraLike } from "../Camera";
import { Transform, TransformLike } from "../Transform/Transform";
import { Component } from "./Component";

export class Entity
{
    components: Component[];
    children: Entity[];
    parent_ptr : Entity | null;
    transform: Transform;
    name: string;
    private lastTransform: Transform;
    private transformMatrix: mat4;
    static Name: string;

    constructor(name: string = (Math.random() * 2000).toString())
    {
        this.transform = new Transform();
        this.components = new Array<Component>();
        this.children = new Array<Entity>();
        this.lastTransform = this.transform.copy();
        this.transformMatrix = this.transform.generateMat4();
        this.name = name;
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: CameraLike)
    {
        for (let component of this.components)
        {
            component.draw_tick(gl, Camera);
        }
        for (let ent of this.children)
        {
            ent.draw_tick(gl, Camera);
        }
    }

    addEntity(ent : Entity)
    {
        ent.parent_ptr = this;
        this.children.push(ent);
    }

    phys_tick()
    {
        for (let component of this.components)
        {
            component.phys_tick();
        }
    }

    copy()
    {
        let copy = new Entity();
        copy.name = this.name.concat(" - Copy");
        copy.transform = this.transform.copy();
        copy.components = this.components.map(v =>
        {
            return v.copy();
        });
        return copy;
    }

    getTransformation()
    {


        if (!this.lastTransform.compare(this.transform))
        {
            this.transformMatrix = this.transform.generateMat4();
            this.lastTransform = this.transform.copy();
        }

        return this.transformMatrix;
    }

    addComponent(component: Component, gl: WebGL2RenderingContext)
    {
        component.attach(this);
        this.components.push(component);
        component.start(gl);
    }

    removeComponent(name: string, gl: WebGL2RenderingContext)
    {

        this.components.filter((v) =>
        {
            if (v.name == name)
            {
                v.end(gl);
                return false;
            }
        });
        return true;
    }

    getComponent(name: string)
    {
        for (let component of this.components)
        {
            if (component.name == name)
            {
                return component;
            }
        }
        return null;
    }
}