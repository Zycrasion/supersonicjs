import { CameraLike } from "../Camera";
import { FrameTexture } from "../Renderables/FrameTextures";
import { GeometryRenderable } from "../Renderables/Renderables";
import { DepthShader } from "../Shaders/DepthShader";
import { Light } from "../Shaders/LightSource";
import { sonic } from "../supersonic";
import { vec4 } from "../Transform/Vector";
import { Entity } from "./Entity";

export interface SceneAttribs
{
    shadowsEnabled?: boolean;
    shadowResolution?: number;
}

export class Scene
{
    Entities: Array<Entity>;
    physicsIterations: number;
    MainCamera: CameraLike;
    light: Light;


    shadowsEnabled: boolean;
    shadowFBO: FrameTexture;
    shadowShader: DepthShader;

    constructor(gl: WebGL2RenderingContext, attribs: SceneAttribs)
    {
        this.Entities = new Array<Entity>();
        this.shadowsEnabled = attribs.shadowsEnabled || false;

        if (this.shadowsEnabled)
        {
            this.shadowFBO = FrameTexture.create(gl, attribs.shadowResolution || 1024, attribs.shadowResolution || 1024, {
                // attachment: gl.DEPTH_ATTACHMENT,
                // format: gl.DEPTH_COMPONENT,
                // internalFormat: gl.DEPTH_COMPONENT32F,
                // storage: gl.FLOAT,
                // filtering: gl.NEAREST
            });
            this.shadowShader = DepthShader.create(gl);
        }

    }

    init(gl: WebGL2RenderingContext)
    {

    }

    updateAllUniforms(gl: WebGL2RenderingContext)
    {
        for (let ent of this.Entities)
        {
            if (ent.getComponent(GeometryRenderable.Name) != null)
            {
                let component = ent.getComponent<GeometryRenderable>(GeometryRenderable.Name);
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
        sonic.clear(gl);
        for (let ent of this.Entities)
        {
            if (this.MainCamera == undefined)
            {
                break;
            }
            ent.draw_tick(gl, this);
        }
        if (true)
        {
            this.shadowFBO.bindFrameBuffer(gl);
            this.shadowShader.bind(gl)
            // let col = sonic.clearColour;
            // sonic.setClearColour(gl, vec4(0.1, 0.1, 0.1, 1));
            gl.clear(gl.DEPTH_BUFFER_BIT);
            this.light.setUniforms(gl, this.shadowShader);
            for (let ent of this.Entities)
            {
                ent.shadow_tick(gl, this, this.shadowShader)
            }
            // sonic.setClearColour(gl, col);
            this.shadowFBO.unbindFrameBuffer(gl);
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