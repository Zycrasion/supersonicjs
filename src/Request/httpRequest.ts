import { Dict } from "../utilities";

export function HTTP_REQUEST(url: string | URL, method: string = "GET", headers: Dict<string> = {})
{
    return new Promise<string>((resolve, reject) =>
    {
        method = method.toUpperCase();
        let Request = new XMLHttpRequest();
        Request.onload = () =>
        {
            resolve(Request.responseText)
        };
        Request.open(method, url);
        Request.send();
    })

}