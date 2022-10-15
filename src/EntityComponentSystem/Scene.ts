import { CameraLike } from "../Camera";
import { GeometryRenderable } from "../Renderables/Renderables";
import { Light } from "../Shaders/LightSource";
import { Entity } from "./Entity";

export class Scene
{
    Entities: Array<Entity>;
    physicsIterations: number;
    MainCamera: CameraLike;

    light : Light;

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
            if (ent.getComponent(GeometryRenderable.Name) != null)
            {
                let component = ent.getComponent(GeometryRenderable.Name) as GeometryRenderable;
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
            ent.draw_tick(gl, this);
        }
    }

    setMainCamera(cam: CameraLike)
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