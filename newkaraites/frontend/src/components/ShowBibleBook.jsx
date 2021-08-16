import React, { useState, useEffect, useRef, } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import CommentsPane from "./CommentPane";
import { getCommentsUrl } from "../constants/constants";
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils";
import Loading from './Loading';
import { BIBLE_ENGLISH, BIBLE_HEBREW, BIBLE_VERSE } from '../constants/constants'


export default function BibleBooksWithComments({ book, chapter, verse, totalChapters, highlight, onClosePane }) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [bookData, setBookData] = useState([])
    const [bookUtils, setBookUtils] = useState([])

    const fullBook = true
    const virtuoso = useRef(null);
    const classes = useStyles()




    const getComments = async (book, chapter, verse) => {
        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            debugger
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
    const onCommentClose = () => {
        setCommentChapter(0)
        setCommentVerse(0)
        setComments([])
    }


    const itemContent = (item, data) => {

        return (
            <Grid container className={classes.textLine} key={item}>
                <Grid item className={classes.text_he}>{data[BIBLE_HEBREW]}</Grid>
                <Grid item className={classes.verseNumber}>{data[BIBLE_VERSE]}</Grid>
                <Grid item className={classes.text_en}>{data[BIBLE_ENGLISH]}</Grid>
            </Grid>

        )
    }

    async function fetchNextData(item) {

        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, true))
        if (response.ok) {
            const data = await response.json()
            setBookData([...bookData, ...data.chapter])
            setBookUtils(data.book)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }
    

    useEffect(() => {
        fetchNextData()
        // let i = (fullBook ? bookUtils['verses'].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1 : verse - 1)
        // virtuoso.current.scrollToIndex({
        //     index: i,
        //     align: 'center',
        // });
    }, [])
    
    if (bookUtils.length === 0) {
        return null
    }
   
    return (
        <div className={classes.container}>
            <Grid container

            >
                <div className={classes.container}>
                    <Virtuoso data={bookData}
                        itemContent={itemContent}
                        ref={virtuoso}
                        components={{
                            Footer: () => {
                                return <Loading />
                            }
                        }}
                    />

                    {comments.length > 0 ?
                        <Grid item xs={4}>
                            <CommentsPane book={book}
                                chapter={commentChapter}
                                verse={commentVerse}
                                comment={comments}
                                closeCommentTabHandler={onCommentClose} />
                        </Grid>
                        : null}
                </div>
            </Grid>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        width: '100%',
        height: 'calc(100vh - 70px)',
        overflowY: 'hidden',
        position: 'fixed',
        top: 70,
    },
    textLine: {
        width: '95%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10,
    },
    text_he: {
        width: '20%',
        direction: 'RTL',
        padding: 10,
    },
    text_en: {
        width: '20%',
        direction: 'LTR',
        padding: 10,
    },
    verseNumber: {
        paddingTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
    },

}
));

