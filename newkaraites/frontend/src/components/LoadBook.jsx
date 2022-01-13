import React, {useContext} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Grid} from '@material-ui/core';
import {parseBiblicalReference} from '../utils/parseBiblicalReference';
import KaraitesBooks from './karaites/karaitesBooks'
import {observer} from 'mobx-react-lite'
import RightPane from './panes/RightPane';
import RenderText from './tanakh/RenderText'
import {makeRandomKey} from '../utils/utils';
import {useHistory, useParams} from 'react-router-dom';
import {karaitesBookUrl, TRANSFORM_TYPE} from '../constants/constants'
import {calculateItemNumber} from '../utils/utils';
import {chaptersByBibleBook} from '../constants/constants'
import {bookChapterUrl} from '../constants/constants'
import {makeBookUrl} from "../utils/utils"
import {storeContext} from "../stores/context";
import {translateMessage} from "./messages/translateMessages";

const PARAGRAPHS = 0

const LoadBook = ({type}) => {
    const store = useContext(storeContext)
    const {book, chapter = 1, verse = 1} = useParams()
    // if type is karaites, chapter is used as start  and verse is ignored
    const classes = useStyles()
    let history = useHistory()

    const onClosePane = (paneNumber) => {
        store.closePane(paneNumber)

        // close all children panes
        if (paneNumber === 0) {
            store.resetPanes()
        }

        if (store.isLastPane) {
            if (type === 'bible') {
                history.push(`/Tanakh/${book}/`)
            }
            if (type === 'karaites') {
                history.push(`/Halakhah/${book}/`)
            }
            if (type === 'liturgy') {
                history.push(`/Liturgy/`)
            }
        }
    }

    async function fetchDataBible(paneNumber) {
        if (store.getBookData(paneNumber).length === 0) {
            const book = store.getBook(paneNumber)
            const response = await fetch(makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false))
            if (response.ok) {
                const data = await response.json()
                store.setBookData(data.chapter, paneNumber)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
    }

    async function fetchDataKaraites(paneNumber) {
        if (store.getParagraphs(paneNumber).length === 0) {
            const response = await fetch(`${karaitesBookUrl}${store.getBook(paneNumber)}/${999999}/${0}/`)
            if (response.ok) {
                const data = await response.json()
                store.setParagraphs(data[PARAGRAPHS][0], paneNumber)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }

    }


    const getBook = async (book, chapter, verse, highlight, type) => {
        type = type.toLowerCase()
        let isOpen = store.isPaneOpen(book, chapter, verse)
        if (!isOpen) {
            if (type === "bible") {
                store.setPanes({
                    book: book,
                    chapter: parseInt(chapter) - 1,
                    verse: verse,
                    bookData: [],
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
                    languages: ['en_he', 'he', 'en'],
                })

                await fetchDataBible(store.panes.length - 1)
            }

            if (type === "karaites" || type === "liturgy") {
                store.setPanes({
                    book: book,
                    chapter: parseInt(chapter) - 1,
                    verse: verse,
                    paragraphs: [],
                    book_details: [],
                    highlight: [],
                    type: type,
                    currentItem: chapter,
                    languages: ['en', 'he'],

                })
                await fetchDataKaraites(store.panes.length - 1)
            }
        }
    }


    const refClick = (item, kind = TRANSFORM_TYPE, paneNumber, e) => {
        if (item !== undefined) {
            store.setCurrentItem(item, paneNumber)
            store.setDistance(0, paneNumber)
        }
        try {
            // ********************
            // todo: check parseBiblicalReference is returning NAN for chapter!!!!!!!
            // ********************
            const {refBook, refChapter, refVerse, refHighlight} = parseBiblicalReference(e)
            debugger
            let isOpen = store.isPaneOpen(refBook, refChapter, refVerse)
            debugger
            if (isOpen) {
                store.setMessage(`${book} ${chapter}:${verse} already open.`)
            } else {
                getBook(refBook, refChapter, refVerse, refHighlight, kind).then().catch()
            }
        } catch (e) {
            store.setMessage(translateMessage(e))
        }
    }

    const RenderRightPane = ({isOpen, paneNumber}) => {
        return (
            <Grid item xs={true} className={(isOpen ? classes.rightPane : classes.hiddenRightPane)}>
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
                    <React.Fragment key={makeRandomKey()}>
                        <Grid item xs={true} className={classes.item}>
                            <RenderText paneNumber={i} onClosePane={onClosePane}/>
                        </Grid>
                        <RenderRightPane isOpen={store.getIsRightPaneOpen(i)} paneNumber={i}/>
                    </React.Fragment>
                ))

            }
            if (panes[i].type.toLowerCase() === 'karaites') {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks
                            paneNumber={i}
                            refClick={refClick}
                            paragraphs={store.getParagraphs(i)}
                            type={type}
                            onClosePane={onClosePane}
                        />
                    </Grid>

                ))
            }
            if (panes[i].type.toLowerCase() === 'liturgy') {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks
                            paneNumber={i}
                            refClick={refClick}
                            paragraphs={store.getParagraphs(i)}
                            type={type}
                            onClosePane={onClosePane}
                        />
                    </Grid>

                ))
            }
        }
        return jsx
    }


    getBook(book, chapter, verse, [], type).then().catch()

    const books = bookRender()

    return (
        <Grid container
              className={classes.root}
              direction="row"
              justifycontent="center"
        >
            {books.map(jsx => jsx)}
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
        fontSize:'21px !important',
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
    },
    items: {
        width: '100%',
        height: '100%',
    }
}));

export default observer(LoadBook)