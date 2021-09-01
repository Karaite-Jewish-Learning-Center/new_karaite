import React, { useEffect, useState } from 'react'
import { makeBookUrl, makeRandomKey } from "../utils/utils";
import { makeStyles } from '@material-ui/core/styles'
import Bible from "./Bible"
import { bookChapterUrl, karaitesBookUrl } from '../constants/constants'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';
import { Redirect } from 'react-router-dom';
import KaraitesBooks from '../components/karaitesBooks'



const PARAGRAPHS = 0
const BOOKS_DETAILS = 1

const LoadBook = ({ book, chapter, verse, type }) => {
    // chapter is use as start if type is 'karaites, verse in ignored

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
            if (type === "bible") {
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
                        type: type,
                        isRightPaneOpen: false,
                        showState: null,

                    }])
                } else {
                    alert("HTTP-Error: " + response.status)
                }
            }
            if (type === "karaites") {
                const response = await fetch(`${karaitesBookUrl}${book}/${chapter}`)
                debugger
                if (response.ok) {
                    const data = await response.json()
                    debugger
                    setPanes([...panes,
                    {
                        book: book,
                        chapter: chapter,
                        verse: verse,
                        paragraphs: data[PARAGRAPHS],
                        book_details: data[BOOKS_DETAILS],
                        highlight: highlight,
                        type: type,
                        isRightPaneOpen: false,
                        showState: null,

                    }])
                } else {
                    alert("HTTP-Error: " + response.status)
                }
            }
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

    const BookRender = ({ pane, i }) => {
        debugger
        if (pane.type === 'bible') {
            return (
                <Bible
                    paneNumber={i}
                    panes={panes}
                    setPanesState={setPanesState}
                    refClick={refClick}
                    closePane={closePane}
                    key={makeRandomKey()}
                />
            )
        }
        if (pane.type === 'karaites') {
            return (
                <KaraitesBooks pane={pane} paneNumber={i} refClick={() => { }} />
            )
        }

        return null
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
                <BookRender pane={pane} i={i} />
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