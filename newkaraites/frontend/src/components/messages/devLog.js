
export const devLog = (message, level=1) => {
    if (process.env.NODE_ENV === 'development') {
        if(level===2){
            alert(message)
            return
        }
        console.log(message)
    }
}

