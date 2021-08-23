import React, { useState } from 'react'
import { Grid } from '@material-ui/core';
import { getCommentsUrl } from '../constants/constants'
import CommentsPane from '../components/CommentPane'
import RenderText from './RenderText'
import RightPane from './RightPane';


export default function Bible({ book, chapter, verse, bookUtils, paneNumber, highlight, refClick }) {
    const [comments, setComments] = useState(null)


    const [commentsNumber, setCommentsNumber] = useState(0)
    const [rightPaneOpen, setRightPaneOpen] = useState(false)


    const openRightPane = () => {
        setRightPaneOpen(true)
    }

    const closeRightPane = () => {
        setRightPaneOpen(false)
    }

    const RenderRightPane = ({ commentsNumber }) => {
        if (rightPaneOpen) {
            return (
                <Grid item xs={3}>
                    <RightPane close={closeRightPane} commentsNumber={commentsNumber} />

                    {/* <RenderComments comments={comments} /> */}
                </Grid>
            )
        }
        return null

    }


    const getComments = async (paneNumber, book, chapter, verse) => {

        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            setComments({ html: data.comments, book: book, chapter: chapter, verse: verse })
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const onCommentOpen = (paneNumber, book, chapter, verse) => {
        getComments(paneNumber, book, chapter, verse)
    }

    const onCommentClose = (paneNumber) => {
        setComments(null)
    }



    const RenderComments = ({ comments }) => {

        if (comments !== null) {
            console.log("rendering RenderComments")
            const { html, book, chapter, verse } = comments
            return (
                <CommentsPane book={book}
                    chapter={chapter}
                    verse={verse}
                    comment={html}
                    closeCommentTabHandler={onCommentClose}
                    refClick={refClick} />
            )
        }
        return null
    }



    return (
        <Grid container>
            <Grid item xs={true}>
                <RenderText book={book}
                    chapter={chapter}
                    verse={verse}
                    verses={bookUtils.book['verses']}
                    bookUtils={bookUtils}
                    openRightPane={openRightPane}
                    setCommentsNumber={setCommentsNumber}
                />
            </Grid>
            <RenderRightPane commentsNumber={commentsNumber} />
        </Grid >
    )
}

