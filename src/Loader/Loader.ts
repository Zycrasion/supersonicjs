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

    protected static CheckFinishedLoadingImages()
    {
        return new Promise<void>((resolve) => {
            let interval = setInterval(check, 100);
            function check()
            {
                if (Loader.imagePending.length == 0)
                {
                    clearInterval(interval);
                    resolve();
                }
            }

        })
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
            this.imageCache[url] = new Image();
            this.imageCache[url].onload = (ev: Event) =>
            {
                this.imagePending = this.imagePending.filter(v => {
                    return v != url;
                });
            }
            this.imageCache[url].src = url;

        })
        await this.CheckFinishedLoadingImages();
    }

    static Free()
    {
        delete this.httpRequests;
        this.httpRequests = {};
        delete this.imageCache;
        this.imageCache = {};
    }
}