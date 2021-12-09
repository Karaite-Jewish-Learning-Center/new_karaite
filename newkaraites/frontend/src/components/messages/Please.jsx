import React,{useContext} from "react"
import {storeContext} from "../../stores/context";


export const Please =({reason})=> {
    const store = useContext(storeContext)
    switch (reason) {
        case "search":
            store.setMessage('Please fill the search box')
            break
        default:
            break
    }
    return (
        <>
        </>
    )
}