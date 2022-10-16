import { Component } from "./src/EntityComponentSystem/Component";
import { Entity } from "./src/EntityComponentSystem/Entity";
import { Scene } from "./src/EntityComponentSystem/Scene";
import { Material } from "./src/Shaders/Material";
import { vec, Vector } from "./src/Transform/Vector";

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
        this.parent_ptr.transform.rotation.add(Math.sin(this.parent_ptr.transform.position.getMagnitude()));
    }
}

export class FollowPosition extends Component
{
    static Name = "FollowPosition";

    following: Vector;
    vel: Vector;

    private mag = 1000;

    constructor(following: Vector)
    {
        super(FollowPosition.Name);
        this.following = following;
        this.vel = vec();
    }

    attach(parent: Entity): void
    {
        this.parent_ptr = parent;
        this.parent_ptr.transform.position.setVec(
            this.following.copy().mult(2)
        )
    }

    draw_tick(gl: WebGL2RenderingContext, scene: Scene): void
    {
        let follow = this.following.copy();
        let currPos = this.parent_ptr.transform.position.copy();
        this.vel.add(follow.sub(currPos).div(this.mag))
        this.parent_ptr.transform.position.add(
            this.vel
        )
        this.parent_ptr.transform.rotation.add(1)
    }

    setMag(m : number)
    {
        this.mag = m;
        return this;
    }
}

export class SpeedColourChange extends Component
{
    static Name = "SpeedColourChange";

    mat : Material;
    vel : Vector;

    constructor(v : Vector, mat : Material)
    {
        super(SpeedColourChange.Name);
        this.vel = v;
        this.mat = mat;
    }

    draw_tick(gl: WebGL2RenderingContext, scene: Scene): void
    {
        let col_shift = this.vel.copy().normalize();
        this.mat.specular = col_shift;
        this.mat.diffuse = col_shift.copy().div(2);
        this.mat.ambient = col_shift.copy().div(10);
    }
}