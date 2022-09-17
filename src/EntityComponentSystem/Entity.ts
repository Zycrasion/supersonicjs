import { mat4 } from "gl-matrix";
import { Camera } from "../Camera";
import { Transform } from "../Transform/Transform";
import { Component } from "./Component";

export class Entity
{
    components: Component[];
    transform: Transform;
    name: string;
    private lastTransform: Transform;
    private transformMatrix: mat4;
    static Name: string;

    constructor(name: string = (Math.random() * 2000).toString())
    {
        this.transform = new Transform();
        this.components = new Array<Component>();
        this.lastTransform = this.transform.copy();
        this.transformMatrix = this.transform.generateMat4();
        this.name = name;
    }

    draw_tick(gl: WebGL2RenderingContext, Camera: Camera)
    {
        for (let component of this.components)
        {
            component.draw_tick(gl, Camera);
        }
    }

    phys_tick()
    {
        for (let component of this.components)
        {
            component.phys_tick();
        }
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