import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core';
import parseBiblicalReference from '../utils/parseBiblicalReference';
//import { Redirect } from 'react-router-dom';
import KaraitesBooks from '../components/karaitesBooks'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite'
import RightPane from './RightPane';
import RenderText from './RenderText'
import { makeRandomKey } from '../utils/utils';


const LoadBook = ({ book, chapter, verse, type }) => {
    // chapter is use as start if type is 'karaites, verse in ignored

    const classes = useStyles()

    const getBook = async (book, chapter, verse) => {
        debugger
        let isOpen = store.getPanes().some((pane) => {
            return pane.book === book && pane.chapter === chapter
        })

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
                    distance: 2,
                })

            }
            if (type === "karaites") {
                store.setPanes({
                    book: book,
                    chapter: chapter,
                    verse: verse,
                    paragraphs: [],
                    book_details: [],
                    highlight: [],
                    type: type,
                })

            }
        }

    }

    const RenderRightPane = ({ isOpen, paneNumber }) => {
        if (isOpen) {
            return (
                <Grid item xs={true} className={classes.rightPane}>
                    <RightPane
                        paneNumber={paneNumber}
                        refClick={refClick}
                    />
                </Grid>
            )
        }
        return null
    }
    const refClick = (e) => {
        const { refBook, refChapter, refVerse, refHighlight } = parseBiblicalReference(e)
        getBook(refBook, refChapter, refVerse, refHighlight)
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
                        <KaraitesBooks paneNumber={i} refClick={refClick} />
                    </Grid>

                ))
            }
        }

        return jsx
    }

    useEffect(() => {
        getBook(book, chapter, verse)
    }, [])


    console.log("is last", store.isLastPane)
    // if (store.isLastPane) return <Redirect to={`/Tanakh/${book}/`} />

    console.log("rendering LoadBook")

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
    },
    item: {
        height: '100%',
        width: 'auto',
    },
    rightPane: {
        maxWidth: '400px !important',
        width: '100%',
    }
}));

export default observer(LoadBook)