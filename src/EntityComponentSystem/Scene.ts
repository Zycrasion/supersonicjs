import { Entity } from "./Entity";

export class Scene
{
    Entities : Array<Entity>;
    physicsIterations : number;

    constructor()
    {
        this.Entities = new Array<Entity>();
    }

    init()
    {

    }

    draw(gl : WebGL2RenderingContext)
    {
        // TODO: No Physics Engine
        // for (let entPhys of this.Entities)
        // {
        //     for (let i=0;i<this.physicsIterations;i++)
        //     {
        //         entPhys.phys_tick();
        //     }
        // }
        for (let ent of this.Entities)
        {
            ent.draw_tick(gl);
        }
    }

    addEntity(entity : Entity)
    {
        this.Entities.push(entity);
    }

    removeEntity(entity : string | Entity)
    {
        let name : string;
        if (typeof entity === "string")
        {
            name = entity;
        } else {
            name = entity.name;
        }
        this.Entities.filter(ent => {
            return ent.name!=name;
        })
    }
}