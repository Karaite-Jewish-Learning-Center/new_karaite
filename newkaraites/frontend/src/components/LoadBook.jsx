import React, { useEffect, useState } from 'react'
import { makeBookUrl, makeRandomKey } from "../utils/utils";
import { makeStyles } from '@material-ui/core/styles'
import Bible from "./Bible"
import { bookChapterUrl } from '../constants/constants'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';
import { Redirect } from 'react-router-dom';



const LoadBook = ({ book, chapter, verse }) => {
    const [panes, setPanes] = useState([])
    const [isLastPane, setIsLastPane] = useState(false)


    const setPanesState = (paneNumber, property, state) => {
        for (let p = 0; p < property.length; p++) {
            panes[paneNumber][property[p]] = state[p]
        }
        setPanes([...panes])
    }

    const getBook = async (book, chapter, verse, highlight) => {
        let isOpen = panes.some((pane) => {
            return pane.book === book && pane.chapter === chapter
        })
        if (!isOpen) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, first, false))
            if (response.ok) {
                const data = await response.json()
                setPanes([...panes,
                {
                    book: book,
                    chapter: chapter,
                    verse: verse,
                    highlight: highlight,
                    bookUtils: data,
                    isRightPaneOpen: false,
                    showState: null,

                }])
            } else {
                alert("HTTP-Error: " + response.status)
            }
        } else {
            // setMessage(`${book} ${chapter}:${verse} is already open.`)
        }
    }

    const classes = useStyles()
    const first = 0  // loading book for the first time

    const refClick = (e) => {
        const { refBook, refChapter, refVerse, refHighlight } = parseBiblicalReference(e)
        getBook(refBook, refChapter, refVerse, refHighlight)
    }

    const closePane = (paneNumber) => {
        panes.splice(paneNumber, 1)
        setPanes([...panes])
        if (panes.length === 0) setIsLastPane(true)
    }


    useEffect(() => {
        getBook(book, chapter, verse, [])
    }, [])

    console.log("rendering LoadBook")

    if (isLastPane) return <Redirect to={`/Tanakh/${book}/`} />

    return (
        <Grid container
            className={classes.root}
            direction="row"
            justifycontent="center"
        >

            {panes.map((pane, i) => (
                <Bible
                    paneNumber={i}
                    panes={panes}
                    setPanesState={setPanesState}
                    refClick={refClick}
                    closePane={closePane}
                    key={makeRandomKey()}
                />
            ))
            }
        </Grid>
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

}));

export default LoadBook