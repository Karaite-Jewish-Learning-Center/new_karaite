
export const devLog = (message:string, level=1):void => {
    if (process.env.NODE_ENV === 'development') {
        if(level===2){
            alert(message)
            return
        }
        console.log(message)
    }
}

