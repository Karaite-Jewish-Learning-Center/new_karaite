import React from "react";
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import transform from "../utils/transform"
import store from "../stores/appState";
import { observer } from "mobx-react-lite";
import { calculateItemNumber } from "../utils/utils";
import { Typography } from "@material-ui/core";


const Comments = ({ language, paneNumber, refClick }) => {

    const ref = 'comment_' + language
    const comments = store.getComments(paneNumber)

    if (comments.length !== 0) {
        return (
            <div key={makeRandomKey()}>
                {comments.map(html => (
                    <>
                        {ReactHtmlParser(html[ref], {
                            decodeEntities: true,
                            transform: transform.bind(this,
                                refClick,
                                calculateItemNumber(html['book'], html['chapter'], html['verse']),
                                'bible',
                                paneNumber)
                        })}
                    </>
                ))}
            </div>
        )
    } else {
        return (
            <>
                <Typography>No comments</Typography>
            </>)
    }


}

export default observer(Comments)
