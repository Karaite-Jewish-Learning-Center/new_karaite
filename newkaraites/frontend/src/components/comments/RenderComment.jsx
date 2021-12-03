import {calculateItemNumber, makeRandomKey} from "../../utils/utils";
import React from "react";
import ReactHtmlParser from "react-html-parser";
import transform from "../../utils/transform";
import {Typography} from "@material-ui/core";

export const RenderComments = ({language, comments, paneNumber, refClick}) => {
    const ref = 'comment_' + language
    if (comments.length) {
        return (
            <div key={makeRandomKey()}>
                {comments.map(html => (
                    <React.Fragment key={makeRandomKey()}>
                        {ReactHtmlParser(html[ref], {
                            decodeEntities: true,
                            transform: transform.bind(this,
                                refClick,
                                calculateItemNumber(html['book'], html['chapter'], html['verse']),
                                'bible',
                                paneNumber)
                        })}
                    </React.Fragment>
                ))}
            </div>
        )
    } else {
        return (
            <Typography>No comments</Typography>
        )
    }
}