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
import { versesByBibleBook } from '../constants/constants'



const LoadBook = ({ book, chapter, verse, type }) => {
    // chapter is use as start if type is 'karaites, verse in ignored


    const classes = useStyles()

    const getBook = async (book, chapter, verse, highlight, type) => {
        let isOpen = store.getPanes().some((pane) => {
            return pane.book === book && pane.chapter === chapter
        })
        if (isOpen) {
            store.setMessage('All ready open.')
            //store.setCurrentItem(versesByBibleBook[book].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1, store.getPaneNumber(book, chapter))
        }

        if (!isOpen) {
            if (type === "bible") {
                store.setPanes({
                    book: book,
                    chapter: chapter,
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
                    currentItem: versesByBibleBook[book].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1,
                    rightPaneState: [],
                    rightPaneStateHalakhah: 1,
                })

            }
            console.log('chapter', chapter)
            if (type === "karaites") {
                store.setPanes({
                    book: book,
                    chapter: chapter,
                    verse: verse,
                    paragraphs: [],
                    book_details: [],
                    highlight: [],
                    type: type,
                    currentItem: chapter,

                })

            }
        }
    }

    const refClick = (item, kind = 'Bible', paneNumber, e) => {
        debugger
        if (item !== undefined) {
            store.setCurrentItem(item, paneNumber)
        }
        const { refBook, refChapter, refVerse, refHighlight } = parseBiblicalReference(e)
        getBook(refBook, refChapter, refVerse, refHighlight, kind)
    }

    const RenderRightPane = ({ isOpen, paneNumber }) => {
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
            if (panes[i].type === 'bible') {

                jsx.push((
                    <>
                        <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                            <RenderText paneNumber={i}
                            />
                        </Grid>
                        <RenderRightPane isOpen={store.getIsRightPaneOpen(i)} paneNumber={i} />
                    </>
                ))

            }
            if (panes[i].type === 'karaites') {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks paneNumber={i} refClick={refClick} highlight={[]} type={'karaites'} />
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