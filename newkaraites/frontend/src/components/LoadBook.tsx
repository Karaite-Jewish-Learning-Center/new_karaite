import React, {useContext, FC} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Grid} from '@material-ui/core';
import {parseBiblicalReference} from '../utils/parseBiblicalReference';
import {observer} from 'mobx-react-lite'
import RightPane from './panes/RightPane';
import RenderText from './tanakh/RenderText'
import {makeRandomKey} from '../utils/utils';
import {useHistory, useParams} from 'react-router-dom';
import {storeContext} from "../stores/context";
import {messageContext} from "../stores/messages/messageContext";
import {translateMessage} from "./messages/translateMessages";
import KaraitesBooks from "./karaites/karaitesBooks";
import {useLocation} from "react-router-dom"
import getBook from "./getBook";
import {getFirstPart} from "../utils/utils";
import {BookType, BibleReference} from "../types/commonTypes";
import BookGrid from './Books/booksGrid';
import {toJS} from 'mobx'

interface BooksProps {
    type: BookType
}

interface RenderRight {
    isOpen: boolean,
    paneNumber: number,
    openBook: (paneNumber: number, refBook: string, refChapter: number, refVerse: number, refHighlight: number[]) => void,
}

interface Params {
    book?: string,
    chapter: string,
    verse: string,
    intro: any
}


const LoadBook: FC<BooksProps> = ({type}) => {
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const {book, chapter, verse = '1', intro = ''}: Params = useParams()
    // path is used as type for the KaraitesBooks component
    const path = getFirstPart(useLocation().pathname)

    // if type is karaites, chapter is used as start  and verse is ignored
    const classes = useStyles()

    let history = useHistory()
    const onClosePane = (paneNumber: number) => {
        store.closePane(paneNumber)

        // close all children panes
        if (paneNumber === 0) {
            store.resetPanes()
        }

        if (store.isLastPane) {
            if (type === 'bible') {
                history.push(`/Tanakh/`)
            } else {
                history.push(`/${path}/`)
            }
        }
    }


    const refClick = (item: any, kind: BookType = 'bible', paneNumber: number, e: Event) => {
        try {
            const {refBook, refChapter, refVerse, refHighlight}: BibleReference = parseBiblicalReference(e)
            let isOpen = store.isPaneOpen(refBook, refChapter, refVerse)
            if (isOpen) {
                message.setMessage(`${book} ${chapter}:${verse} already open.`)
            } else {
                getBook(refBook, refChapter, refVerse, refHighlight, kind, store, message).then().catch()
            }
        } catch (e) {
            message.setMessage(translateMessage(e))
        }
    }

    const openBook = (paneNumber: number, refBook: string, refChapter: number, refVerse: number, refHighlight: number[]) => {
        try {
            getBook(refBook, refChapter, refVerse, refHighlight, 'karaites', store, message).then().catch()
        } catch (e) {
            message.setMessage(translateMessage(e))
        }
    }

    const RenderRightPane: FC<RenderRight> = ({isOpen, paneNumber, openBook}) =>
        <Grid item xs={true} className={(isOpen ? classes.rightPane : classes.hiddenRightPane)}>
            <RightPane
                paneNumber={paneNumber}
                refClick={refClick}
                openBook={openBook}
            />
        </Grid>


    const bookRender = () => {

        const panes = store.getPanes()
        let jsx = []

        for (let i = 0; i < panes.length; i++) {
            switch (panes[i].type.toLowerCase()) {
                case 'bible':
                    jsx.push((
                        <React.Fragment key={makeRandomKey()}>
                            <Grid item xs={true} className={classes.item}>
                                <RenderText paneNumber={i} onClosePane={onClosePane}/>
                            </Grid>
                            <RenderRightPane isOpen={store.getIsRightPaneOpen(i)} paneNumber={i} openBook={openBook}/>
                        </React.Fragment>
                    ))
                    break
                case 'karaites':
                    debugger
                    jsx.push((
                        <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                            <KaraitesBooks
                                paneNumber={i}
                                refClick={refClick}
                                paragraphs={store.getParagraphs(i)}
                                details={store.getBookDetails(i)}
                                type={path}
                                onClosePane={onClosePane}
                                jumpToIntro={intro === 'intro'}
                            />
                        </Grid>
                    ))
                    break
                case 'better':
                    console.log('better')
                    console.log(toJS(store.getBookBetter(i)))
                    jsx.push((
                        <Grid item xs={true} className={classes.item} key={makeRandomKey()}>
                            <BookGrid
                                paneNumber={i}
                                bookData={store.getBookBetter(i)}
                                // refClick={refClick}
                                // paragraphs={store.getParagraphs(i)}
                                // details={store.getBookDetails(i)}
                                // type={path}
                                // onClosePane={onClosePane}
                                // jumpToIntro={intro === 'intro'}
                            />
                        </Grid>
                    ))
                    break;
                default:
                    console.log('Invalid type', panes[i].type)
            }
        }
        return jsx
    }



    getBook(book || '', +chapter, +verse, [], type, store, message)

    if (store.getPanes().length === 0) return null

    const books = bookRender()

    if (books.length === 0) return null

    return (
        <Grid container
              className={`${classes.root} ${book}`}
              direction="row"
              justifyContent="center">
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