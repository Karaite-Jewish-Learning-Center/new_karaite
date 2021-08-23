import React, { useEffect, useState } from 'react'
import { makeBookUrl, makeRandomKey } from "../utils/utils";
import { makeStyles } from '@material-ui/core/styles'
import Bible from "./Bible"
import { bookChapterUrl } from '../constants/constants'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';

const LoadBook = ({ book, chapter, verse }) => {
    const [panes, setPanes] = useState([])

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


    useEffect(() => {
        getBook(book, chapter, verse, [])
    }, [])

    if (panes.length === 0) return null
    console.log("rendering LoadBook")
    return (

        <Grid container className={classes.root}

        >
            {panes.map((pane, i) => (
                <Bible book={pane.book}
                    chapter={pane.chapter}
                    verse={pane.verse}
                    bookUtils={pane.bookUtils}
                    paneNumber={i}
                    highlight={pane.highlight}
                    refClick={refClick}
                    key={makeRandomKey()}
                />
            ))
            }
        </Grid>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        height: 'calc(95vh - 70px)',
        overflowY: 'hidden',
        position: 'fixed',
        top: 70,
    },

}));

export default LoadBook