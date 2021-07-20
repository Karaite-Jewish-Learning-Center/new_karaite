import React, {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import KaraitesBooks from "./karaitesBooks";
import BiblicalText from "./BiblicalText";
import parseBiblicalReference from "../utils/parseBiblicalReference";
import {getCommentsUrl} from "../constants/constants";
import CommentsPane from "./CommmentPane";
import {makeRandomKey} from "../utils/utils";


export default function PresentKaraitesBooks() {
    const [panes, setPanes] = useState([])
    const classes = useStyles()

    const refClick = (e) => {
        const {book, chapter, verse, highlight} = parseBiblicalReference(e)
        setPanes([...panes, {book: book, chapter: chapter, verse: verse, highlight: highlight}])
    }

    const onClosePane = (position) => {
        panes.splice(position, 1)
        setPanes([...panes])
    }

    const getComments = async (paneNumber, book, chapter, verse) => {
        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            panes[paneNumber].comments = {html: data.comments, book: book, chapter: chapter, verse: verse}
            setPanes([...panes])
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const onCommentOpen = (paneNumber, book, chapter, verse) => {
        getComments(paneNumber, book, chapter, verse)
    }
    const onCommentClose = (paneNumber) => {
        delete panes[paneNumber].comments
        setPanes([...panes])
    }

    const renderText = (pane, i) => {
        return (
            <Grid item xs>
                <BiblicalText book={pane.book}
                              chapter={pane.chapter}
                              verse={pane.verse}
                              highlight={pane.highlight}
                              fullBook={false}
                              comment={pane.comments}
                              onClosePane={onClosePane.bind(this, i)}
                              onCommentOpen={onCommentOpen}
                              paneNumber={i}/>
            </Grid>
        )
    }
    const renderComments = (pane, i) => {
        if (pane.comments !== undefined) {
            const {html, book, chapter, verse} = pane.comments
            return (
                <Grid item xs>
                    <CommentsPane book={book}
                                  chapter={chapter}
                                  verse={verse}
                                  comment={html}
                                  closeCommentTabHandler={onCommentClose.bind(this, i)}
                                  refClick={refClick}/>
                </Grid>
            )
        }
        return null
    }

    return (
        <div className={classes.container} key={makeRandomKey()}>
            <Grid container spacing={0}>
                <Grid item xs className={classes.left}>
                    <KaraitesBooks book={'Yeriot Shelomo'} chapter={2} fullBook={true} refClick={refClick}/>
                </Grid>
                {panes.map((pane, i) => (
                    <>
                        {renderText(pane, i)}
                        {renderComments(pane, i)}
                    </>
                ))}
            </Grid>
        </div>
    )
}

const useStyles = makeStyles((theme) => (
    {
        container: {
            flexGrow: 1,
            position: 'fixed',
            width: '100%',
            height: '85vh',
            top: 60,
        }, left: {
            height: '85vh',
            top: 70,
        }
    }
))
