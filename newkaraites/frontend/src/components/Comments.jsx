import React from "react";
import {makeRandomKey} from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';


export default function Comments({language, comments, refClick}) {

    const transform = (node) => {

        if (node.type === 'tag') {
            // rewrite the span with a onClick event handler
            if (node.name === 'span') {
                if (node['attribs']['class'] === 'en-biblical-ref') {
                    return <span key={makeRandomKey()} lang="EN" onClick={refClick} className="en-biblical-ref">{node['children'][0]['data']}</span>
                }
                if (node['attribs']['class'] === 'he-biblical-ref') {
                    return <span key={makeRandomKey()} lang="HE" onClick={refClick} className="he-biblical-ref">{node['children'][0]['data']}</span>
                }
            }

        }
    }
    // field name
    const ref = 'comment_' + language
    return (
        <div key={makeRandomKey}>
            {comments.map(html => (
                <>
                    {ReactHtmlParser(html[ref], {
                        decodeEntities: true,
                        transform: transform
                    })}
                </>
            ))}
        </div>
    )


}

