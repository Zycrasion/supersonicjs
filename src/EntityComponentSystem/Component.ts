import { CameraLike } from "../Camera";
import { Entity } from "./Entity";
import { Scene } from "./Scene";

export class Component
{
    parent_ptr: Entity;
    name: string;
    static Name: string;
    constructor(name: string) { this.name = name; }
    attach(parent: Entity) { this.parent_ptr = parent; }
    start(gl: WebGL2RenderingContext) { }
    draw_tick(gl: WebGL2RenderingContext, scene : Scene) { }
    phys_tick() { }
    copy(params = {}): Component { return new Component(this.name.concat(" - Copy")) }
    end(gl: WebGL2RenderingContext) { }
}