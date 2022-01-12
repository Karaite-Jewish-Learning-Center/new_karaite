import {calculateItemNumber, makeRandomKey} from "../../utils/utils";
import React from "react";
import {Typography} from "@material-ui/core";
import parse from 'html-react-parser'
import {TRANSFORM_TYPE} from '../../constants/constants'
import transform from "../../utils/transform";


export const RenderComments = ({language, comments, paneNumber, refClick}) => {
    const ref = 'comment_' + language
    if (comments.length) {
        return (
            <div key={makeRandomKey()}>
                {comments.map(html => (
                    <React.Fragment key={makeRandomKey()}>
                        {parse(html[ref], {
                            replace: domNode => {
                                return transform(refClick,
                                    calculateItemNumber(html['book'], html['chapter'], html['verse']),
                                    TRANSFORM_TYPE,
                                    paneNumber,
                                    domNode)
                            }
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