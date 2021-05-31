import axios from 'axios';
import {getCommentsUrl} from "../constants"


const getComments  = async (chapter, verse) => {
   const res =  await axios.get(getCommentsUrl + `Deuteronomy/${chapter}/${verse}`)
   return res;
}

const makeRandomKey =() =>{
    return `k-${Math.random()}`
}

export {
    getComments,
    makeRandomKey
}