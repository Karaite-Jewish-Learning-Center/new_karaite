import React, { useEffect, useState } from 'react'
import { makeBookUrl } from "../utils/utils";
import { makeStyles } from '@material-ui/core/styles'
import Bible from "./Bible"
import { bookChapterUrl } from '../constants/constants'
import { getCommentsUrl } from "../constants/constants";
import { Grid } from '@material-ui/core';
import CommentsPane from "./CommentPane";
import parseBiblicalReference from '../utils/parseBiblicalReference';


const LoadBook = ({ book, chapter, verse }) => {
    const [bookUtils, setBookUtils] = useState(null)
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [grid, setGrid] = useState([12, 1])

  
    const classes = useStyles()
    const first = 0  // loading book for the first time

    const refClick = (e) => {
        debugger
        const { refbook, refChapter, refVerse, RefHighlight } = parseBiblicalReference(e)
    }

    async function fetchData(item) {
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, first, false))
        if (response.ok) {
            const data = await response.json()
            setBookUtils(data)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }
    const getComments = async (book, chapter, verse) => {
        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            setComments(data.comments)
            setGrid([8, 4])
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const onCommentOpen = (paneNumber, chapter, verse) => {
        chapter = parseInt(chapter) 
        if (chapter !== commentChapter || verse !== commentVerse) {
            setCommentChapter(chapter)
            setCommentVerse(verse)
            getComments(book, chapter, verse)
        }
    }
    const onCommentClose = () => {
        setCommentChapter(0)
        setCommentVerse(0)
        setComments([])
        setGrid([12, 1])
    }

    useEffect(() => {
        fetchData()
    }, [])


    if (bookUtils === null) return null

    return (
        <Grid container className={classes.root}>
            <Grid item xs={true}>
                <Bible book={book}
                    chapter={chapter}
                    verse={verse}
                    bookUtils={bookUtils}
                    onCommentOpen={onCommentOpen}
                    onCommentClose={onCommentClose}
                    comments={comments}
                />
            </Grid>
            {comments.length > 0 ?
                <Grid item xs={grid[1]}>
                    <CommentsPane book={book}
                        chapter={commentChapter}
                        verse={commentVerse}
                        comment={comments}
                        closeCommentTabHandler={onCommentClose}
                        refClick={refClick}
                    />
                </Grid >
                : null}
        </Grid>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        height: 'calc(95vh - 70px)',
        overflowY: 'hidden',
        position: 'fixed',
        top: 70,
    },

}));

export default LoadBook