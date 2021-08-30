import React, { useState } from 'react'
import { Grid } from '@material-ui/core';
import RenderText from './RenderText'
import RightPane from './RightPane';
import { makeStyles } from '@material-ui/core/styles'


export default function Bible({ book, chapter, verse, bookUtils, paneNumber, highlight, refClick, closePane }) {

    const [rightPaneNumbers, setRightPaneNumbers] = useState([])
    const [rightPaneOpen, setRightPaneOpen] = useState(false)
    const [showState, setShowState] = useState(null)

    const classes = useStyles()

    const closeRightPane = () => {
        setRightPaneOpen(false)
        setShowState(null)
    }
    const openRightPane = () => {
        setRightPaneOpen(true)
    }
    const backButton = () => {
        setShowState(null)
    }
    const RenderRightPane = () => {
        if (rightPaneOpen) {
            return (
                <Grid item xs className={classes.rightPane}>
                    <RightPane
                        back={backButton}
                        close={closeRightPane}
                        rightPaneNumbers={rightPaneNumbers}
                        showState={showState}
                        setShowState={setShowState}
                        refClick={refClick}
                    />
                </Grid>
            )
        }
        return null
    }

    return (
        <>
            <Grid item xs className={classes.item} >
                <RenderText
                    book={book}
                    chapter={chapter}
                    verse={verse}
                    verses={bookUtils.book['verses']}
                    bookUtils={bookUtils}
                    paneNumber={paneNumber}
                    openRightPane={openRightPane}
                    setRightPaneNumbers={setRightPaneNumbers}
                    isRightPaneOpen={rightPaneOpen}
                    closePane={closePane}
                />
            </Grid>
            <RenderRightPane />
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: 'calc(95vh - 70px)',
        overflowY: 'hidden',
        position: 'fixed',
        top: 70,
    },
    item: {
        height: '100%'
    },
    rightPane: {
        maxWidth: 400,
    }
}));
