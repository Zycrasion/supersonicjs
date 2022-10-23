import { mat4 } from "gl-matrix";
import { CameraLike } from "../Camera";
import { Shader3D } from "../Shaders/3DShader";
import { BaseMaterial } from "../Shaders/Material";
import { Transform, TransformLike } from "../Transform/Transform";
import { Component } from "./Component";
import { Scene } from "./Scene";

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

    draw_tick(gl: WebGL2RenderingContext, scene : Scene)
    {
        for (let component of this.components)
        {
            component.draw_tick(gl, scene);
        }
        for (let ent of this.children)
        {
            ent.draw_tick(gl, scene);
        }
    }

    shadow_tick(gl: WebGL2RenderingContext, scene : Scene, shader : Shader3D)
    {
        for (let component of this.components)
        {
            component.shadow_tick(gl, scene, shader);
        }
        for (let ent of this.children)
        {
            ent.shadow_tick(gl, scene, shader);
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

    addComponent(component: Component)
    {
        component.attach(this);
        this.components.push(component);
        return this;
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

    getComponent<T extends Component>(name : string ) : T
    {
        for (let component of this.components)
        {
            if (component.name == name)
            {
                return component as T;
            }
        }
        return null;
    }
}