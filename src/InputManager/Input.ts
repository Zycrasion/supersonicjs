import { Vector } from "../Transform/Vector";

type callbackType = "keydown" | "keyup" | "keypress";
type keyCallback = (type: callbackType) => void;

interface keyCallbackMap
{
    [key: string]: InputKey;
}

class InputKey
{
    listeners: Array<keyCallback>;
    isPressed: boolean;

    constructor()
    {
        this.listeners = [];
    }

    addListener(callback: keyCallback)
    {
        this.listeners.push(callback);
    }

    callback(type: callbackType)
    {
        if (type == "keydown")
        {
            this.isPressed = true;
        } else if (type == "keyup")
        {
            this.isPressed = false;
        }
        this.listeners.forEach(v =>
        {
            v(type);
        })
    }

}

export class InputAxis
{
    negativeX: string; // KeyNames
    positiveX: string; // KeyNames
    negativeY: string;
    positiveY: string;
    manager: InputManager;

    constructor(manager: InputManager, pX: string, nX: string, pY: string = "", nY: string = "")
    {
        this.manager = manager;
        this.positiveX = pX;
        this.negativeX = nX;

        this.positiveY = pY;
        this.negativeY = nY;
    }

    getAxis()
    {
        let x = 0;
        let y = 0;
        x += this.manager.getKey(this.positiveX).isPressed ? 1 : 0;
        x -= this.manager.getKey(this.negativeX).isPressed ? 1 : 0;
        y += this.manager.getKey(this.positiveY).isPressed ? 1 : 0;
        y -= this.manager.getKey(this.negativeY).isPressed ? 1 : 0;
        return new Vector(
            x,
            y
        )
    }
}

export class InputManager
{

    listeners: keyCallbackMap;

    constructor()
    {
        this.listeners = {};
        window.addEventListener("keydown", this._KeyHandler.bind(this));
        window.addEventListener("keyup", this._KeyHandler.bind(this));
        window.addEventListener("keypress", this._KeyHandler.bind(this));
    }

    getKey(keyName: string)
    {
        if (this.listeners[keyName.toUpperCase()] == null)
        {
            this.listeners[keyName.toUpperCase()] = new InputKey()
        }
        return this.listeners[keyName.toUpperCase()];
    }

    addKeyListener(keyName: string, callback: keyCallback)
    {
        if (this.listeners[keyName.toUpperCase()] == null)
        {
            this.listeners[keyName.toUpperCase()] = new InputKey()
        }
        this.listeners[keyName.toUpperCase()].addListener(callback);
    }

    private _KeyHandler(event: KeyboardEvent)
    {
        if (this.listeners[event.key.toUpperCase()])
        {
            this.listeners[event.key.toUpperCase()].callback(event.type as callbackType)
        }
    }
}