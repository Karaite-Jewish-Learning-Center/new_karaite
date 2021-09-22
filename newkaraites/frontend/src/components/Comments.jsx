import React from "react";
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import transform from "../utils/transform"
import store from "../stores/appState";
import { observer } from "mobx-react-lite";
import { calculateItemNumber } from "../utils/utils";


const Comments = ({ language, paneNumber, refClick }) => {

    const ref = 'comment_' + language
    return (
        <div key={makeRandomKey()}>
            {store.getComments(paneNumber).map(html => (
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


}

export default observer(Comments)
