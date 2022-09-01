export class Vector
{
    x : number; y : number; z : number;
    constructor()
    {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }

    set(a : number , b = a, c = a)
    {
        this.x = a;
        this.y = b;
        this.z = c;
    }

    toFloat32Array() : Float32Array
    {
        return new Float32Array([this.x,this.y,this.z])
    }

    toArray() : Array<number>
    {
        return [this.x,this.y,this.z]
    }
}
