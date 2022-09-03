import * as utils from "./utilities";
import {Vector, Vector4} from "./Vector";
import {Transform} from './Transform';
import {Shader, ShaderDefaults} from './Shaders/Shader'
import { FlatShader } from "./Shaders/FlatShader";
import { ImageShader } from "./Shaders/ImageShader";
import { InputAxis, InputManager } from "./InputManager/Input";

export class SupersonicJS
{
    static Vector = Vector;
    static Vector4 = Vector4;
    static utils = utils;
    static Transform =Transform;
    static Shaders = {Shader, ImageShader, FlatShader};
    static ShaderDefaults = ShaderDefaults;
    static Input = {InputAxis, InputManager};
}