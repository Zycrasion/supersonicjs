import { Component } from "../EntityComponentSystem/Component";
import { Scene } from "../EntityComponentSystem/Scene";
import { Vector } from "../Transform/Vector";

export class SoundPlayer extends Component
{
    private reference : HTMLAudioElement;
    private position : Vector = null;
    pos_cutoff : number = 10.0;

    get duration()
    {
        return this.reference.duration;
    }

    static Name = "SoundPlayer";

    constructor()
    {
        super(SoundPlayer.Name);
    }

    loadAUDIO(url : string) : Promise<void>
    {
        return new Promise<void>(
            (resolve, reject) => {
                this.reference = new Audio(url);
                this.reference.addEventListener("canplaythrough", (event) => {
                    this.reference.pause();
                    this.reference.currentTime = 0;
                    resolve();
                });
                this.reference.autoplay = true;
            }
        )
    }

    // draw_tick(gl: WebGL2RenderingContext, scene: Scene): void
    // {
    //     if (this.position != null)
    //     {
    //         let volume = 1;
    //         let dist = scene.MainCamera.getPosition().toVector3().sub(this.position).getMagnitude();
    //         if (dist < this.pos_cutoff)
    //         {
    //             volume = Math.abs(1 - (dist / this.pos_cutoff));
    //             console.log(volume)
    //         } else {
    //             volume = 0;
    //         }
    //         this.reference.volume = Math.max(Math.min(volume, 0.0), 1.0);
    //     }
    // }

    // setPosition(pos : Vector)
    // {
    //     this.position = pos;
    // }

    play()
    {
        if (!this.isValid()) {return;}
        this.reference.play();
    }

    pause()
    {
        if (!this.isValid()) {return;}
        this.reference.pause();
    }

    loop(loop : boolean = !this.reference.loop)
    {
        if (!this.isValid()) {return;}
        this.reference.loop = loop;
    }

    isValid() : boolean
    {
        if (this.reference == null) { console.error("AUDIO OBJECT NULL, THIS HAPPENS WHEN sound.delete() is called and the reference to the soundplayer class has been called."); return false; }
        return true;    
    }

    delete()
    {
        this.reference = null;
    }
}