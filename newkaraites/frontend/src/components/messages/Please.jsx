import React,{useContext} from "react"
import {messageContext} from "../../stores/messages/messageContext";


export const Please =({reason})=> {
    const message = useContext(messageContext)
    switch (reason) {
        case "search":
            message.setMessage('Please fill the search box')
            break
        default:
            break
    }
    return (
        <>
        </>
    )
}