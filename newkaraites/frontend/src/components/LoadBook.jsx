import React, { useEffect, useState } from 'react'
import { makeBookUrl, makeRandomKey } from "../utils/utils";
import { makeStyles } from '@material-ui/core/styles'
import Bible from "./Bible"
import { bookChapterUrl, karaitesBookUrl } from '../constants/constants'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';
import { Redirect } from 'react-router-dom';
import KaraitesBooks from '../components/karaitesBooks'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite'


const PARAGRAPHS = 0
const BOOKS_DETAILS = 1

const LoadBook = ({ book, chapter, verse, type }) => {
    // chapter is use as start if type is 'karaites, verse in ignored


    const getBook = async (book, chapter, verse, highlight) => {

        let isOpen = store.getPanes().some((pane) => {
            return pane.book === book && pane.chapter === chapter
        })

        if (!isOpen) {
            if (type === "bible") {
                store.setPanes({
                    book: book,
                    chapter: chapter,
                    verse: verse,
                    highlight: highlight,
                    type: type,
                    verseData: [],

                })
            }
            if (type === "karaites") {
                const response = await fetch(`${karaitesBookUrl}${book}/${chapter}`)
                debugger
                if (response.ok) {
                    const data = await response.json()
                    debugger
                    store.setPanes({
                        book: book,
                        chapter: chapter,
                        verse: verse,
                        paragraphs: data[PARAGRAPHS],
                        book_details: data[BOOKS_DETAILS],
                        highlight: highlight,
                        type: type,
                    })
                } else {
                    alert("HTTP-Error: " + response.status)
                }
            }
        }

    }

    const classes = useStyles()

    const refClick = (e) => {
        const { refBook, refChapter, refVerse, refHighlight } = parseBiblicalReference(e)
        getBook(refBook, refChapter, refVerse, refHighlight)
    }


    const BookRender = ({ panes, i }) => {
        for (let i = 0; i < panes.length; i++) {

            if (panes[i].type === 'bible') {
                return (
                    <Bible
                        paneNumber={i}
                        refClick={refClick}
                        key={makeRandomKey()}
                    />
                )
            }
            if (panes[i].type === 'karaites') {
                return (null

                    // <KaraitesBooks pane={pane} paneNumber={i} refClick={refClick} />
                )
            }
        }
        return null
    }

    useEffect(() => {
        getBook(book, chapter, verse, [])
    }, [])

    if (store.isLastPane()) return <Redirect to={`/Tanakh/${book}/`} />
    console.log("rendering LoadBook")
    return (
        <Grid container
            className={classes.root}
            direction="row"
            justifycontent="center"
        >
            <BookRender key={makeRandomKey()} panes={store.getPanes()} />
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

export default observer(LoadBook)