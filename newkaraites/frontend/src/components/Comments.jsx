import React from "react";
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import transform from "../utils/transform"



export default function Comments({ language, comments, refClick }) {


    const ref = 'comment_' + language
    return (
        <div key={makeRandomKey()}>
            {comments.map(html => (
                <>
                    {ReactHtmlParser(html[ref], {
                        decodeEntities: true,
                        transform: transform.bind(this, refClick)
                    })}
                </>
            ))}
        </div>
    )


}

