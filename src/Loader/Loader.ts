import { throws } from "assert";
import { Camera, ProjectionType } from "../Camera";
import { Scene } from "../EntityComponentSystem/Scene";
import { SquareMesh } from "../Renderables/DefaultMeshes/square";
import { GeometryRenderable2D } from "../Renderables/Renderables";
import { HTTP_REQUEST } from "../Request/httpRequest";
import { FlatShader } from "../Shaders/FlatShader";
import { ImageShader } from "../Shaders/ImageShader";
import { SupersonicJS } from "../supersonic";
import { Vector4 } from "../Transform/Vector";
import { Dict, UV } from "../utilities";


export class Loader extends Scene
{
    // [key] = [url]
    loadElements: Dict<string>;
    loadFunctions : Array<() => Promise<void>>;
    loaded: Dict<string>;
    percentage = 0;
    loading = true;
    splashImage : GeometryRenderable2D;
    splashScreenTime = 1000

    constructor()
    {
        super();
        this.loadFunctions = [];
        this.loadElements = {}
        this.loaded = {};
        this.MainCamera = new Camera(ProjectionType.ORTHOGRAPHIC);
    }

    addLoadItem(url, id)
    {
        this.loadElements[id] = url;
    }

    addLoadFunction(func : () => Promise<void>)
    {
        this.loadFunctions.push(func);
    }

    async beginLoad(gl : WebGL2RenderingContext , callback : () => void)
    {
        this.init(gl);
        console.log("Beginning Loading Process")
        let i =0;
        for (let [id, url] of Object.entries(this.loadElements))
        {
            let text = await HTTP_REQUEST(url);
            this.loaded[id] = text;
            i++;
            this.percentage = i/(Object.values(this.loadElements).length + this.loadFunctions.length)
            console.log(`Loaded ID ${id} ${Math.trunc(this.percentage*100)}% `)
        } 
        for (let func of this.loadFunctions)
        {
            await func();
            i++;
            this.percentage = i/(Object.values(this.loadElements).length + this.loadFunctions.length)
            console.log(`Loaded Func ${Math.trunc(this.percentage*100)}%`);
        }
        setTimeout(()=>
        {
            this.loading = false;       
            callback();    
        }, this.splashScreenTime)
    }

    init(gl : WebGL2RenderingContext): void
    {
        let imageShader = ImageShader.create(gl, "/images/logo.png", UV.DefaultSquare(gl), gl.LINEAR)
        // let imageShader= FlatShader.create(gl)
        // imageShader.colour = new Vector4(1,1,1,1)
        this.splashImage = new GeometryRenderable2D(
            gl,
            SquareMesh(),
            imageShader
        );
        this.splashImage.transform.position.z = -1;
        this.splashImage.transform.scale.set(200)
        gl.clearColor(0,0,0,1);
        this.draw(gl);
    }



    draw(gl: WebGL2RenderingContext): void
    {
        SupersonicJS.clear(gl);
        this.splashImage.draw_tick(gl, this.MainCamera);
        if (this.loading)
        {
            requestAnimationFrame(this.draw.bind(this,gl))
        }
    }
}