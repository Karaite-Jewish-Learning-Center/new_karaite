import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';
import KaraitesBooks from '../components/karaitesBooks'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite'
import RightPane from './RightPane';
import RenderText from './RenderText'
import { makeRandomKey } from '../utils/utils';
import { Redirect } from 'react-router-dom';
import Message from './Message'
import { karaitesBookUrl } from '../constants/constants'
import { calculateItemNumber } from '../utils/utils';
import { chaptersByBibleBook } from '../constants/constants'
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils"


const PARAGRAPHS = 0


const LoadBook = ({ book, chapter, verse, type }) => {
    // if type is 'karaites, chapter is use as start  and is verse in ignored

    const classes = useStyles()

    async function fetchDataBible(paneNumber) {
        let c = store.getBookData(paneNumber).length
        debugger
        if (store.getBookData(paneNumber).length === 0) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], 0, false))
            if (response.ok) {
                const data = await response.json()
                //setVerses(data.book.verses)
                store.setBookData(data.chapter, paneNumber)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
    }

    async function fetchDataKaraites(paneNumber) {
        if (store.getParagraphs(paneNumber).length === 0) {
            const chapter = store.getKaraitesChapter(paneNumber)
            debugger
            const response = await fetch(`${karaitesBookUrl}${book}/${chapter}/${0}/`)
            if (response.ok) {
                const data = await response.json()
                store.setParagraphs(data[PARAGRAPHS][0], paneNumber)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }

    }


    const getBook = async (book, chapter, verse, highlight, type) => {
        debugger
        type = type.toLowerCase()
        let isOpen = store.isPaneOpen(book, chapter)

        if (isOpen) {
            store.setMessage('All ready open.')
        } else {

            if (type === "bible") {
                store.setPanes({
                    book: book,
                    chapter: parseInt(chapter) - 1,
                    verse: verse,
                    highlight: [],
                    type: type,
                    verseData: [],
                    commentTab: 0,
                    comments: [],
                    commentsChapter: 0,
                    commentsVerse: 0,
                    isRightPaneOpen: false,
                    references: [],
                    distance: 0,
                    currentItem: calculateItemNumber(book, chapter, verse),
                    rightPaneState: [],
                    rightPaneStateHalakhah: 1,
                    bookData: [],
                    first: 0,
                })

                fetchDataBible(store.panes.length - 1)
            }

            if (type === "karaites") {
                store.setPanes({
                    book: book,
                    chapter: 9999999,
                    verse: verse,
                    paragraphs: [],
                    book_details: [],
                    highlight: [],
                    type: type,
                    currentItem: chapter,

                })
                fetchDataKaraites(store.panes.length - 1)
            }
        }
    }

    const refClick = (item, kind = 'bible', paneNumber, e) => {
        if (item !== undefined) {
            store.setCurrentItem(item, paneNumber)
            store.setDistance(0, paneNumber)
        }
        const { refBook, refChapter, refVerse, refHighlight } = parseBiblicalReference(e)
        getBook(refBook, refChapter, refVerse, refHighlight, kind)
    }

    const RenderRightPane = ({ isOpen, paneNumber }) => {
        return (
            <Grid item xs={true} className={(true ? classes.rightPane : classes.hiddenRightPane)}>
                <RightPane
                    paneNumber={paneNumber}
                    refClick={refClick}
                />
            </Grid>
        )

    }


    const bookRender = () => {
        const panes = store.getPanes()
        let jsx = []

        for (let i = 0; i < panes.length; i++) {
            if (panes[i].type.toLowerCase() === 'bible') {

                jsx.push((
                    <>
                        <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                            <RenderText paneNumber={i}
                            />
                        </Grid>
                        <RenderRightPane isOpen={true} paneNumber={i} />
                    </>
                ))

            }
            if (panes[i].type.toLowerCase() === 'karaites') {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks paneNumber={i} refClick={refClick} paragraphs={store.getParagraphs(i)} />
                    </Grid>

                ))
            }
        }
        return jsx
    }

    useEffect(() => {
        getBook(book, chapter, verse, [], type)
    }, [])

    const books = bookRender()

    if (store.getIsLastPane() && books.length === 0) {
        if (type === 'bible') {
            return (<Redirect to={`/Tanakh/${book}/`} />)
        } else {
            return (<Redirect to={`/Halakhah/${book}/`} />)
        }
    }

    return (
        <>
            <Message />
            <Grid container
                className={classes.root}
                direction="row"
                justifycontent="center"
                key={makeRandomKey()}
            >
                {books.map(jsx => jsx)}
            </Grid>
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
        height: '100%',
        width: 'auto',
    },
    rightPane: {
        maxWidth: '400px !important',
        width: '100%',
    },
    hiddenRightPane: {
        display: 'none'
    }
}));

export default observer(LoadBook)