import React,{useContext, FC} from "react"
import {messageContext} from "../../stores/messages/messageContext";
import {MessageReason} from "../../types/commonTypes";

interface Props {
    reason: MessageReason
}

export const Please:FC<Props> =({reason})=> {
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