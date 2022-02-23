import {slug} from "./utils";

export const cleanUrl = (url:string):string => {
    let result = slug(url.trim().split(',')[0])
    if (result.startsWith('-')) {
        result = result.substring(1)
    }
    return result
}
