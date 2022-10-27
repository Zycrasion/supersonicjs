import { CameraLike } from "../Camera";
import { Shader3D } from "../Shaders/3DShader";
import { Entity } from "./Entity";
import { Scene } from "./Scene";

export class Component
{
    parent_ptr: Entity;
    readonly name: string;
    static Name: string;
    constructor(name: string) { this.name = name; }
    attach(parent: Entity) { this.parent_ptr = parent; }
    start(gl: WebGL2RenderingContext) { }
    draw_tick(gl: WebGL2RenderingContext, scene: Scene) { }
    shadow_tick(gl: WebGL2RenderingContext, scene: Scene, shader: Shader3D) { }
    phys_tick() { }
    copy(params = {}): Component { return new Component(this.name.concat(" - Copy")) }
    end(gl: WebGL2RenderingContext) { }
    toEntity(): Entity
    {
        return new Entity().addComponent(this);
    }
}