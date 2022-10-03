import { HTTP_REQUEST } from "../Request/httpRequest";
import { Dict } from "../utilities";


export class Loader
{

    static imageCache: Dict<HTMLImageElement> = {};
    static imagePending: Array<string> = [];

    static httpRequests: Dict<string> = {};
    static httpPending: Array<string> = [];


    static LoadImage(url: string): HTMLImageElement | string
    {
        if (url in this.imageCache)
        {
            return this.imageCache[url];
        } else
        {
            return "404";
        }

    }

    static CacheImage(url: string)
    {
        this.imagePending.push(url);
    }

    static LoadHTTP(url: string)
    {
        if (url in this.httpRequests)
        {
            return this.httpRequests[url];
        } else
        {
            return "404";
        }
    }

    static CacheHTTP(url: string)
    {
        this.httpPending.push(url);
    }

    static async LoadAll()
    {
        this.httpPending.forEach(async url =>
        {
            this.httpRequests[url] = await HTTP_REQUEST(url);
        })
        this.httpPending = [];

        this.imagePending.forEach(async url =>
        {
            await (() =>
            {
                return new Promise<void>(resolve =>
                {
                    this.imageCache[url] = new Image();
                    this.imageCache[url].onload = (ev: Event) =>
                    {
                        resolve();
                    }
                    this.imageCache[url].src = url;
                })

            })()

        })
        this.imagePending = [];
    }

    static Free()
    {
        delete this.httpRequests;
        this.httpRequests = {};
        delete this.imageCache;
        this.imageCache = {};
    }
}