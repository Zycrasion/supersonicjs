import { Component } from "./src/EntityComponentSystem/Component";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { vec } from "./src/Transform/Vector";

export class Rotating extends Component
{
    static Name = "RotatingComponent";
    constructor()
    {
        super(Rotating.Name)
    }

    draw_tick(gl: WebGL2RenderingContext, scene: Scene): void
    {
        this.parent_ptr.transform.position.setVec(
            scene.light.position.copy().mult(-1)
        )
        this.parent_ptr.transform.rotation.add(vec(Math.random(), Math.random(), Math.random()).div(10));
    }
}