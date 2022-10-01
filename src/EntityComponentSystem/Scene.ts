import { Camera } from "../Camera";
import { Entity } from "./Entity";

export class Scene
{
    Entities: Array<Entity>;
    physicsIterations: number;
    MainCamera: Camera;

    constructor()
    {
        this.Entities = new Array<Entity>();
    }

    init(gl: WebGL2RenderingContext)
    {

    }

    draw(gl: WebGL2RenderingContext)
    {
        // TODO: No Physics Engine
        // for (let entPhys of this.Entities)
        // {
        //     for (let i=0;i<this.physicsIterations;i++)
        //     {
        //         entPhys.phys_tick();
        //     }
        // }
        if (this.MainCamera == null)
        {
            return;
        }
        for (let ent of this.Entities)
        {
            ent.draw_tick(gl, this.MainCamera);
        }
    }

    setMainCamera(cam: Camera)
    {
        this.MainCamera = cam;
    }

    addEntity(entity: Entity)
    {
        this.Entities.push(entity);
    }

    removeEntity(entity: string | Entity)
    {
        let name: string;
        if (typeof entity === "string")
        {
            name = entity;
        } else
        {
            name = entity.name;
        }
        this.Entities.filter(ent =>
        {
            return ent.name != name;
        })
    }
}