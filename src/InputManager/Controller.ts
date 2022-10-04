import { vec, Vector } from "../Transform/Vector";
import { InputAxis, InputManager } from "./Input";

export enum GamepadType 
{
    XBOX,
    UNSUPPORTED
}

export enum XBOX_ANALOG_RAW
{
    LEFT_X,
    LEFT_Y,
    LEFT_TRIGGER,
    RIGHT_X,
    RIGHT_Y,
    RIGHT_TRIGGER,
    DPAD_X,
    DPAD_Y
} 

export enum XBOX_ANALOG_INPUTS
{
    LEFT_STICK,
    RIGHT_STICK,
    DPAD
}

export enum XBOX_DIGITAL_INPUTS
{
    A,
    B,
    Y,
    X,
    LEFT_BUMPER,
    RIGHT_BUMPER,
    SHARE,
    MENU,
    XBOX,
    LEFT_STICK,
    RIGHT_STICK
}

export class Controller
{
    manager: InputManager;
    gamepad : Gamepad;
    type = GamepadType.XBOX; 
    active = false;
    deadZone = 0.1;

    constructor(gamepad : Gamepad)
    {
        this.gamepad = gamepad;
        this.active = true;
    }

    getButton(input : XBOX_DIGITAL_INPUTS)
    {
        return this.gamepad.buttons[input];
    }

    getAnalogRaw(input : XBOX_ANALOG_RAW)
    {
        if (Math.abs(this.gamepad.axes[input]) < this.deadZone)
        {
            return 0;
        }
        return this.gamepad.axes[input];
    }
    
    getAnalogStick(input : XBOX_ANALOG_INPUTS): Vector
    {
        if (this.type == GamepadType.UNSUPPORTED)
        {
            throw new Error("Gamepad UNSUPPORTED");
        }

        if (input==XBOX_ANALOG_INPUTS.LEFT_STICK)
        {
            return vec(this.getAnalogRaw(XBOX_ANALOG_RAW.LEFT_X),this.getAnalogRaw(XBOX_ANALOG_RAW.LEFT_Y));
        }

        if (input==XBOX_ANALOG_INPUTS.RIGHT_STICK)
        {
            return vec(this.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_X),this.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_Y));
        }

        throw new Error("INPUT DOESNT EXIST")
    }
    
}