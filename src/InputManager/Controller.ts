import { vec, Vector } from "../Transform/Vector";
import { InputAxis, InputManager } from "./Input";
import { XBOX_DIGITAL_INPUTS, XBOX_ANALOG_RAW, XBOX_ANALOG_INPUTS } from "./mappings/xbox_mappings";

export enum GamepadType 
{
    XBOX,
    QUEST,
    UNSUPPORTED
}

export type DIGITAL_INPUT = XBOX_DIGITAL_INPUTS;
export type ANALOG_INPUT = XBOX_ANALOG_INPUTS;
export type ANALOG_INPUT_RAW = XBOX_ANALOG_RAW;


export class Controller
{
    manager: InputManager;
    gamepad: Gamepad;
    type = GamepadType.XBOX;
    active = false;
    deadZone = 0.1;
    right_trigger_pressed = false;
    left_trigger_pressed = false;

    constructor(gamepad: Gamepad)
    {
        this.gamepad = gamepad;
        this.active = true;
    }

    getButton(input: DIGITAL_INPUT)
    {
        return this.gamepad.buttons[input];
    }

    getAnalogRaw(input: XBOX_ANALOG_RAW)
    {
        switch (this.type)
        {
            case GamepadType.XBOX:
                if (input == XBOX_ANALOG_RAW.RIGHT_TRIGGER && this.right_trigger_pressed == false)
                {
                    if (this.gamepad.axes[XBOX_ANALOG_RAW.RIGHT_TRIGGER] == 0)
                    {
                        return -1;
                    } else
                    {
                        this.right_trigger_pressed = true;
                    }
                }

                if (input == XBOX_ANALOG_RAW.LEFT_TRIGGER && this.left_trigger_pressed == false)
                {
                    if (this.gamepad.axes[XBOX_ANALOG_RAW.LEFT_TRIGGER] == 0)
                    {
                        return -1;
                    } else
                    {
                        this.left_trigger_pressed = true;
                    }
                }
                break;

            case GamepadType.QUEST:
                break;
        }


        if (Math.abs(this.gamepad.axes[input]) < this.deadZone)
        {
            return 0;
        }
        return this.gamepad.axes[input];
    }

    getAnalogStick(input: ANALOG_INPUT): Vector
    {
        if ([GamepadType.UNSUPPORTED].includes(this.type))
        {
            throw new Error("Gamepad UNSUPPORTED");
        }


        switch (this.type)
        {
            case GamepadType.XBOX:
                if (input == XBOX_ANALOG_INPUTS.LEFT_STICK)
                {
                    return vec(this.getAnalogRaw(XBOX_ANALOG_RAW.LEFT_X), this.getAnalogRaw(XBOX_ANALOG_RAW.LEFT_Y));
                }

                if (input == XBOX_ANALOG_INPUTS.RIGHT_STICK)
                {
                    return vec(this.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_X), this.getAnalogRaw(XBOX_ANALOG_RAW.RIGHT_Y));
                }

                if (input == XBOX_ANALOG_INPUTS.DPAD)
                {
                    return vec(this.getAnalogRaw(XBOX_ANALOG_RAW.DPAD_X), this.getAnalogRaw(XBOX_ANALOG_RAW.DPAD_Y));
                }
                break;

            case GamepadType.QUEST:

                break;
        }



        throw new Error("INPUT DOESNT EXIST")
    }

}