import React, {useContext} from "react";
import {useParams} from "react-router-dom";
import HalakhahMenu from "./HalakhahMenu";
import {storeContext} from "../../stores/context";


export const HalakhahBookLink = () => {
        const store = useContext(storeContext)
        store.resetPanes()
        const { book } = useParams()
        return (<HalakhahMenu book={book} />)
    }
