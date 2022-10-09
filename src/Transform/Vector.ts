import { Math2 } from "../utilities";

export function vec(x = 0, y = 0, z = 0)
{
    return new Vector(x, y, z);
}

export function vec4(x = 0, y = 0, z = 0, w = 0)
{
    return new Vector4(x, y, z, w);
}


export interface VectorLike
{
    x: number;
    y: number;
    z: number;
}

export interface Quaternion
{
    x: number;
    y: number;
    z: number;
    w: number;
}

export class Vector
{
    x: number; y: number; z: number;

    static ZERO = new Vector();
    static UP = new Vector(0, 1, 0);
    static DOWN = new Vector(0, -1, 0);
    static FOWARD = new Vector(0, 0, 1);
    static BACKWARD = new Vector(0, 0, -1);
    static RIGHT = new Vector(1, 0, 0);
    static LEFT = new Vector(-1, 0, 0);

    constructor(x = 0, y = 0, z = 0)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
    // bruh my brain hurts
    fromQuat(q: Quaternion)
    {
        // x axis
        let sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
        let cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
        this.x = Math.atan2(sinr_cosp, cosr_cosp);

        // y axis
        let sinp = 2 * (q.w * q.y - q.z * q.x);
        if (Math.abs(sinp) >= 1)
        {
            this.y = Math2.copySign(Math.PI / 2, sinp);
        } else
        {
            this.y = Math.asin(sinp);
        }

        // z axis
        let siny_cosp = 2 * (q.w * q.z + q.x * q.y);
        let cosy_cosp = 2 * (q.w * q.z + q.x * q.y);
        this.z = Math.atan2(siny_cosp, cosy_cosp);
    }

    setVec(v: VectorLike)
    {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    set(a: number, b = a, c = a)
    {
        this.x = a;
        this.y = b;
        this.z = c;
        return this;
    }

    div(o: number | Vector)
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

    add(o: number | Vector)
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

    mult(o: number | Vector)
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

    sub(o: number | Vector)
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

    normalize()
    {
        let mag = this.getMagnitude();
        this.div(mag);
        return this;
    }

    getMagnitude()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    compare(o: Vector)
    {
        return o.x == this.x && o.y == this.y && o.z == this.z;
    }

    copy(): Vector
    {
        return new Vector(this.x, this.y, this.z);
    }

    // Future Proofing
    toFloatArray(): Float32Array
    {
        return this.toFloat32Array();
    }

    toFloat32Array(): Float32Array
    {
        return new Float32Array([this.x, this.y, this.z])
    }

    toFloat64Array(): Float64Array
    {
        return new Float64Array([this.x, this.y, this.z])
    }

    toArray(): Array<number>
    {
        return [this.x, this.y, this.z]
    }

    static unpackVertices(array: Array<Vector>): Array<number>
    {
        let unpacked = array.flatMap(v => [v.x, v.y, v.z]);
        return unpacked;
    }
}

export class Vector4 extends Vector
{
    w: number;
    constructor(x = 0, y = 0, z = 0, w = 0)
    {
        super(x, y, z);
        this.w = w;
    }

    copy(): Vector4
    {
        let v = super.copy();
        return new Vector4(v.x, v.y, v.z, this.w);
    }

    toFloat32Array(): Float32Array
    {
        return new Float32Array([this.x, this.y, this.z, this.w])
    }

    toArray(): number[]
    {
        return [this.x, this.y, this.z, this.w]
    }

    toVector3(): Vector
    {
        return new Vector(this.x, this.y, this.z);
    }

}