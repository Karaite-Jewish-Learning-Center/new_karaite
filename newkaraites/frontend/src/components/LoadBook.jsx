import React, {useEffect, useContext} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Grid} from '@material-ui/core';
import {parseBiblicalReference} from '../utils/parseBiblicalReference';
import KaraitesBooks from './karaites/karaitesBooks'
import {observer} from 'mobx-react-lite'
import RightPane from './panes/RightPane';
import RenderText from './tanakh/RenderText'
import {makeRandomKey} from '../utils/utils';
import {Redirect, useParams, useHistory} from 'react-router-dom';
import {karaitesBookUrl} from '../constants/constants'
import {calculateItemNumber} from '../utils/utils';
import {chaptersByBibleBook} from '../constants/constants'
import {bookChapterUrl} from '../constants/constants'
import {makeBookUrl} from "../utils/utils"
import {storeContext} from "../stores/context";
import {translateMessage} from "./messages/translateMessages";


const PARAGRAPHS = 0

const LoadBook = ({type}) => {
    const store = useContext(storeContext)
    const {book, chapter, verse = 1} = useParams()
    // if type is karaites, chapter is used as start  and verse is ignored
    const history = useHistory()
    const classes = useStyles()

    async function fetchDataBible(paneNumber) {
        if (store.getBookData(paneNumber).length === 0) {
            const book = store.getBook(paneNumber)
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
            const response = await fetch(`${karaitesBookUrl}${store.getBook(paneNumber)}/${chapter}/${0}/`)
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
        let isOpen = store.isPaneOpen(book)
        if (isOpen) {
            if (history.action !== 'POP') {
                store.setCurrentItem(calculateItemNumber(book, chapter, verse), store.getPaneNumber(book))
            }
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
                    language: 0,
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
                    language: 0,

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
        try {
            const {refBook, refChapter, refVerse, refHighlight} = parseBiblicalReference(e)
            getBook(refBook, refChapter, refVerse, refHighlight, kind)
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
                    <>
                        <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                            <RenderText paneNumber={i}
                            />
                        </Grid>
                        <RenderRightPane isOpen={store.getIsRightPaneOpen(i)} paneNumber={i}/>
                    </>
                ))

            }
            if (panes[i].type.toLowerCase() === 'karaites') {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks paneNumber={i} refClick={refClick} paragraphs={store.getParagraphs(i)}/>
                    </Grid>

                ))
            }
        }
        return jsx
    }

    useEffect(() => {
        getBook(book, chapter, verse, [], type)
    }, [book, chapter, verse])

    const books = bookRender()

    if (store.getIsLastPane() && books.length === 0) {
        if (type === 'bible') {
            return (<Redirect to={`/Tanakh/${book}/`}/>)
        } else {
            return (<Redirect to={`/Halakhah/${book}/`}/>)
        }
    }

    return (
        <>
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