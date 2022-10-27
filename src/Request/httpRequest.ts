import { Loader } from "../Loader/Loader";
import { Dict } from "../utilities";

export function HTTP_REQUEST(url: string, method: string = "GET", headers: Dict<string> = {})
{
    return new Promise<string>((resolve, reject) =>
    {
        let response = Loader.LoadHTTP(url);
        if (response != "404")
        {
            resolve(response);
            return;
        }

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