import { Camera } from "../Camera";
import { GeometryRenderable2D, GeometryRenderable3D } from "../Renderables/Renderables";
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

    updateAllUniforms(gl : WebGL2RenderingContext)
    {
        for (let ent of this.Entities)
        {
            if (ent.getComponent(GeometryRenderable3D.Name) != null)
            {
                let component = ent.getComponent(GeometryRenderable3D.Name) as GeometryRenderable3D;
                component.shader.updateUniforms(gl);
            }
        }
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
            if (this.MainCamera==undefined)
            {
                break;
            }
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