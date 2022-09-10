export class Vector
{
    x : number; y : number; z : number;
    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(a : number , b = a, c = a)
    {
        this.x = a;
        this.y = b;
        this.z = c;
    }

    div(o : number | Vector)
    {
        if (typeof o === "number")
        {
            this.x /= o;
            this.y /= o;
            this.z /= o;
            return this;
        }
        this.x /= o.x;
        this.y /= o.y;
        this.z /= o.z;
        return this;
    }

    add(o : number | Vector)
    {
        if (typeof o === "number")
        {
            this.x += o;
            this.y += o;
            this.z += o;
            return this;
        }
        this.x += o.x;
        this.y += o.y;
        this.z += o.z;
        return this;
    }

    mult(o : number | Vector)
    {
        if (typeof o === "number")
        {
            this.x *= o;
            this.y *= o;
            this.z *= o;
            return this;
        }
        this.x *= o.x;
        this.y *= o.y;
        this.z *= o.z;
        return this;
    }

    sub(o : number | Vector)
    {
        if (typeof o === "number")
        {
            this.x -= o;
            this.y -= o;
            this.z -= o;
            return this;
        }
        this.x -= o.x;
        this.y -= o.y;
        this.z -= o.z;
        return this;
    }

    copy() : Vector
    {
        return new Vector(this.x,this.y,this.z);
    }

    // Future Proofing
    toFloatArray() : Float32Array
    {
        return this.toFloat32Array();
    }

    toFloat32Array() : Float32Array
    {
        return new Float32Array([this.x,this.y,this.z])
    }

    toFloat64Array() : Float64Array
    {
        return new Float64Array([this.x,this.y,this.z])
    }

    toArray() : Array<number>
    {
        return [this.x,this.y,this.z]
    }
}

export class Vector4 extends Vector
{
    w : number;
    constructor(x = 0, y = 0 , z = 0 , w = 0)
    {
        super(x,y,z);
        this.w = w;
    }

    toFloat32Array(): Float32Array {
        return new Float32Array([this.x, this.y, this.z, this.w])
    }

    toArray(): number[] {
        return [this.x,this.y,this.z,this.w]
    }

}