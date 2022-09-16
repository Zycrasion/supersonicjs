import { Transform } from "../Transform/Transform";
import { Component } from "./Component";

export class Entity
{
    components : Component[];
    transform : Transform;
    name : string;

    constructor(name : string = (Math.random() * 2000).toString())
    {
        this.transform = new Transform();
        this.components = new Array<Component>();
        this.name = name;
    }

    draw_tick(gl : WebGL2RenderingContext)
    {
        for (let component of this.components)
        {
            component.draw_tick(gl);
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
        return this.transform.generateMat4();
    }

    addComponent(component : Component, gl : WebGL2RenderingContext)
    {
        component.attach(this);
        this.components.push(component);
        component.start(gl);
    }

    removeComponent(name : string, gl : WebGL2RenderingContext)
    {

        this.components.filter((v)=>{
            if (v.name==name)
            {
                v.end(gl);
                return false;
            }
        });
        return true;
    }

    getComponent(name : string)
    {
        for (let component of this.components)
        {
            if (component.name==name)
            {   
                return component;
            }   
        }
        return null;
    }
}