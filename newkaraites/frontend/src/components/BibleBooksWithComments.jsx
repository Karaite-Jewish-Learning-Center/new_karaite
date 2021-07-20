import React, {useState} from 'react'
import Grid from '@material-ui/core/Grid'
import {makeStyles} from '@material-ui/core/styles'
import BiblicalText from "./BiblicalText";
import CommentsPane from "./CommmentPane";
import {container} from "../constants/common-css";
import {getCommentsUrl} from "../constants/constants";

export default function BibleBooksWithComments({book, chapter, verse, highlight, fullBook, onClosePane}) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const classes = container()

    const getComments = async (book, chapter, verse) => {
        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            setComments(data.comments)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const onCommentOpen = (chapter, verse) => {
        chapter = parseInt(chapter) + 1
        if (chapter !== commentChapter || verse !== commentVerse) {
            setCommentChapter(chapter)
            setCommentVerse(verse)
            getComments(book, chapter, verse)
        }
    }
    const onCommentClose = ()=>{
        setCommentChapter(0)
        setCommentVerse(0)
        setComments([])
    }
    return (
        <div >

                <Grid item xs className={classes.left}>
                    <BiblicalText
                        book={book}
                        chapter={chapter}
                        verse={verse}
                        highlight={[1]}
                        fullBook={true}
                        onClosePane={() => {
                        }}
                        onCommentOpen={onCommentOpen}
                    />
                </Grid>
                {comments.length > 0 ?
                    <Grid item xs={4}>
                        <CommentsPane book={book}
                                      chapter={commentChapter}
                                      verse={commentVerse}
                                      comment={comments}
                                      closeCommentTabHandler={onCommentClose}/>
                    </Grid>
                    : null}
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
        container: {
            flexGrow: 1,
            position: 'fixed',
            width: '100%',
            height: '85vh',
            top: 60,
        },
        left: {
            height: '85vh',
            top: 70,
        }
    }
));

