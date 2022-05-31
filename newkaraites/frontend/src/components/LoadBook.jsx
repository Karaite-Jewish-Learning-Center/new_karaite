import React, {useContext} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Grid} from '@material-ui/core';
import {parseBiblicalReference} from '../utils/parseBiblicalReference';
import {observer} from 'mobx-react-lite'
import RightPane from './panes/RightPane';
import RenderText from './tanakh/RenderText'
import {capitalize, makeRandomKey} from '../utils/utils';
import {useHistory, useParams} from 'react-router-dom';
import {TRANSFORM_TYPE} from '../constants/constants'
import {storeContext} from "../stores/context";
import {translateMessage} from "./messages/translateMessages";
import KaraitesBooks from "./karaites/karaitesBooks";
import getBook from "./getBook";


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
                history.push(`/Tanakh/`)
                return
            }
            if (type === 'karaites') {
                history.push(`/Halakhah/`)
                return
            }

            history.push(`/${capitalize(type)}/`)
        }
    }


    const refClick = (item, kind = TRANSFORM_TYPE, paneNumber, e) => {
        if (item !== undefined) {
            store.setCurrentItem(item, paneNumber)
            store.setDistance(0, paneNumber)
        }
        try {
            const {refBook, refChapter, refVerse, refHighlight} = parseBiblicalReference(e)
            let isOpen = store.isPaneOpen(refBook, refChapter, refVerse)
            if (isOpen) {
                store.setMessage(`${book} ${chapter}:${verse} already open.`)
            } else {
                getBook(refBook, refChapter, refVerse, refHighlight, kind, store).then().catch()
            }
        } catch (e) {
            store.setMessage(translateMessage(e))
        }
    }

    const openBook = (paneNumber, refBook, refChapter, refVerse, refHighlight) => {
        try {
            getBook(refBook, refChapter, refVerse, refHighlight, '', store).then().catch()
        } catch (e) {
            store.setMessage(translateMessage(e))
        }
    }

    const RenderRightPane = ({isOpen, paneNumber, openBook}) => {
        return (
            <Grid item xs={true} className={(isOpen ? classes.rightPane : classes.hiddenRightPane)}>
                <RightPane
                    paneNumber={paneNumber}
                    refClick={refClick}
                    openBook={openBook}
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
                        <RenderRightPane isOpen={store.getIsRightPaneOpen(i)} paneNumber={i} openBook={openBook}/>
                    </React.Fragment>
                ))

            } else {
                jsx.push((
                    <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                        <KaraitesBooks
                            paneNumber={i}
                            refClick={refClick}
                            paragraphs={store.getParagraphs(i)}
                            details={store.getBookDetails(i)}
                            type={type}
                            onClosePane={onClosePane}
                        />
                    </Grid>
                ))
            }
        }
        return jsx
    }
    getBook(book, chapter, verse, [], type, store).then().catch()

    const books = bookRender()
    if (books.length === 0) {
        return null
    }
    return (
        <Grid container
              className={`${classes.root} ${book}`}
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
        top: 66,
        height: 'calc(95vh - 66px)',
        position: 'sticky',
        fontSize: '21px !important',
        [theme.breakpoints.down('xs')]: {
            top: 59,
            height: 'calc(95vh - 59px)',
        },
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