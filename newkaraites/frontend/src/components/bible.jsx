import React, { useState } from 'react'
import { Grid } from '@material-ui/core';
import RenderText from './RenderText'
import RightPane from './RightPane';
import { makeStyles } from '@material-ui/core/styles'


export default function Bible({ paneNumber, panes, refClick, closePane, setPanesState }) {
    const [rightPaneNumbers, setRightPaneNumbers] = useState([])
    const pane = panes[paneNumber]
    const book = pane['book']
    const chapter = pane['chapter']
    const verse = pane['verse']
    const bookUtils = pane['bookUtils']

    const classes = useStyles()

    const closeRightPane = () => {
        setPanesState(paneNumber,
            ['isRightPaneOpen', 'showState'],
            [false, null]
        )
    }
    const openRightPane = () => {
        setPanesState(paneNumber,
            ['isRightPaneOpen', 'showState'],
            [true, null]
        )
    }
    const backButton = () => {
        setPanesState(paneNumber, ['showState'], [null])
    }

    const RenderRightPane = () => {
        let pane = panes[paneNumber]

        if (pane.isRightPaneOpen) {
            return (
                <Grid item xs className={classes.rightPane}>
                    <RightPane
                        back={backButton}
                        close={closeRightPane}
                        rightPaneNumbers={rightPaneNumbers}
                        showState={pane.showState}
                        paneNumber={paneNumber}
                        setPanesState={setPanesState}
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
                    isRightPaneOpen={panes[paneNumber]['isRightPaneOpen']}
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
