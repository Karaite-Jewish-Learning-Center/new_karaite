import React, { useState, useEffect, useRef } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import CommentsPane from "./CommentPane";
import { getCommentsUrl } from "../constants/constants";
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl, calculateIndex, fillDataStructure } from "../utils/utils";
import Loading from './Loading';
import { BIBLE_ENGLISH, BIBLE_HEBREW, BIBLE_VERSE } from '../constants/constants'


export default function BibleBooksWithComments({ book, chapter, verse, dataPlaceHolder, bookUtils }) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [bookData, setBookData] = useState([...dataPlaceHolder])
    const [currentChapter, setCurrentChapter] = useState(chapter)

    const classes = useStyles()

    const virtuoso = useRef(null);

    const getComments = async (book, chapter, verse) => {
        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        debugger
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

    async function fetchData(chapter) {

        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
        if (response.ok) {
            const data = await response.json()
            setBookData(fillDataStructure(data, currentChapter, verse, bookData))
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const checkRange = (visible) => {
        let index = Math.round(calculateIndex(bookUtils, currentChapter + 1, verse) * 0.70)
        if (index >= visible.endIndex) {
            setCurrentChapter((currentChapter) => currentChapter + 1)
            fetchData(currentChapter)
        }

        // index = Math.round(calculateIndex(bookUtils, currentChapter -1 , verse) * 0.70)
        // if (index < visible.endIndex) {
        //     debugger
        //     fetchData(currentChapter- 1)
        // }
        console.log(visible.startIndex, visible.endIndex, index)
    }
    useEffect(() => {
        if (bookUtils !== null) {
            let i = calculateIndex(bookUtils, currentChapter, verse)
            console.log('index', i)
            virtuoso.current.scrollToIndex({
                index: i,
                align: 'center',
            });
        }
    }, [])


    if (bookUtils === null) {
        return null
    }

    return (
        <div className={classes.container}>
            <Grid container

            >
                <div className={classes.container}>
                    <Virtuoso data={bookData}
                        rangeChanged={checkRange}
                        ref={virtuoso}
                        itemContent={itemContent}
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
