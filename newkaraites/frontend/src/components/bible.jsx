import React, { useState } from 'react'
import { Grid } from '@material-ui/core';
//import { getCommentsUrl } from '../constants/constants'
//import CommentsPane from '../components/CommentPane'
import RenderText from './RenderText'
import RightPane from './RightPane';


export default function Bible({ book, chapter, verse, bookUtils, paneNumber, highlight, refClick }) {

    const [rightPaneNumbers, setRightPaneNumbers] = useState([])
    const [rightPaneOpen, setRightPaneOpen] = useState(false)
    const [showState, setShowState] = useState(null)

    const closeRightPane = () => {
        setRightPaneOpen(false)
        setShowState(null)
    }

    const backButton = () => {
        setShowState(null)
    }
    const RenderRightPane = () => {
        if (rightPaneOpen) {
            return (
                <Grid item xs={4}>
                    <RightPane
                        back={backButton}
                        close={closeRightPane}
                        rightPaneNumbers={rightPaneNumbers}
                        showState={showState}
                        setShowState={setShowState}
                    />
                </Grid>
            )
        }
        return null
    }

    return (
        <Grid container>
            <Grid item xs={true}>
                <RenderText
                    book={book}
                    chapter={chapter}
                    verse={verse}
                    verses={bookUtils.book['verses']}
                    bookUtils={bookUtils}
                    openRightPane={() => { setRightPaneOpen(true) }}
                    setRightPaneNumbers={setRightPaneNumbers}
                    isRightPaneOpen={rightPaneOpen}
                />
            </Grid>
            <RenderRightPane />
        </Grid >
    )
}

