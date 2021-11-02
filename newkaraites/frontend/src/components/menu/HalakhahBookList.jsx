import React from "react";
import {useParams} from "react-router-dom";
import HalakhahMenu from "../HalakhahMenu";
import store from "../../stores/appState";


export const HalakhahBookLink = () => {
        store.resetPanes()
        let { book } = useParams()
        return (<HalakhahMenu book={book} />)
    }
