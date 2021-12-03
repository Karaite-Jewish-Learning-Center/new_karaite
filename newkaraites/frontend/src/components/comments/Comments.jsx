import React, {useContext} from "react";
import {observer} from "mobx-react-lite";
import {storeContext} from "../../stores/context"
import {RenderComments} from "./RenderComment"


const Comments = ({language, paneNumber, refClick}) => {
    const store = useContext(storeContext)
    const comments = store.getComments(paneNumber)

    return <RenderComments
        language={language}
        comments={comments}
        paneNumber={paneNumber}
        refClick={refClick}
    />
}

export default observer(Comments)
