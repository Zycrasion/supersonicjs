import { SupersonicJS } from "../supersonic";
import { vec4 } from "../Transform/Vector";
import { XRCamera } from "./XRCamera";

type XRDrawCallback = (xr: XR, gl: WebGL2RenderingContext, camera: XRCamera, frame : XRFrame) => void;
type XRSetupCallback = (xr: XR, gl: WebGL2RenderingContext) => void;

export class XR
{
    gl: WebGL2RenderingContext;
    referenceSpace: XRReferenceSpace;

    session : XRSession;

    inputSources : XRInputSourceArray;

    xr_draw: XRDrawCallback;
    xr_setup: XRSetupCallback;

    constructor(gl = null)
    {
        if (!XR.xrAvailable())
        {
            console.error("XR NOT AVAILABLE!");
            return;
        }
        this.gl = gl;
    }

    async init(type: XRSessionMode)
    {
        let available = await XR.checkSessionAvailability(type);
        if (available == false)
        {
            console.error("%s NOT AVAILABLE", type);
            return;
        }
        let button = document.createElement("button");
        button.innerText = "Start VR";
        button.addEventListener("click", this.initSession.bind(this, type));
        document.body.appendChild(button);
    }

    onResize()
    {
        this.gl.canvas.width =  this.gl.canvas.clientWidth * window.devicePixelRatio;
        this.gl.canvas.height = this.gl.canvas.clientHeight * window.devicePixelRatio;
    }

    protected async initSession(type: XRSessionMode)
    {
        if (this.gl == null)
        {
            let canvas = document.createElement("canvas");
            canvas.id = "xrCanvas";
            document.body.appendChild(canvas);

            this.gl = SupersonicJS.init(canvas.id, vec4(0.25, 0.25, 0.25, 1), { xrCompatible: true });
        }

        let session = await navigator.xr.requestSession(type);
        this.session = session;

        this.session.addEventListener("inputsourceschange", this.updateInputSources.bind(this))
        
        this.inputSources = this.session.inputSources;

        let glLayer = new XRWebGLLayer(session, this.gl);
        session.updateRenderState({
            baseLayer: glLayer
        })

        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        this.referenceSpace = await session.requestReferenceSpace("local");

        this.xr_setup(this, this.gl);

        session.requestAnimationFrame(this.draw.bind(this))
    }

    protected draw(time: DOMHighResTimeStamp, frame: XRFrame)
    {
        let pose = this.getPose(frame);


        if (pose)
        {
            let layer = frame.session.renderState.baseLayer;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, layer.framebuffer);
            SupersonicJS.clear(this.gl);
            for (let view of pose.views)
            {
                let viewport = layer.getViewport(view);
                this.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)
                this.xr_draw(this, this.gl, new XRCamera(view), frame);
            }
        }
        frame.session.requestAnimationFrame(this.draw.bind(this));
    }

    getPose(frame: XRFrame): XRViewerPose
    {
        return frame.getViewerPose(this.referenceSpace);
    }

    protected updateInputSources(event : XRInputSourceChangeEvent)
    {
        this.inputSources = event.session.inputSources;
    }

    static async checkSessionAvailability(type: XRSessionMode)
    {
        let isEnabled = await navigator.xr.isSessionSupported(type);
        return isEnabled;
    }

    static xrAvailable(): boolean
    {
        if (navigator.xr == null)
        {
            return false;
        }
        return true;
    }
}