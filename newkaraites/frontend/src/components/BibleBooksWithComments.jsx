import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import CommentsPane from "./CommentPane";
import { getCommentsUrl } from "../constants/constants";
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils";
import Loading from './Loading';
import { BIBLE_ENGLISH, BIBLE_HEBREW, BIBLE_VERSE } from '../constants/constants'

const id = 100000

export default function BibleBooksWithComments({ book, chapter, verse, totalChapters, highlight, onClosePane }) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [bookData, setBookData] = useState([])
    const [lastChapter, setLastChapter] = useState(chapter - 1)
    const [firstChapter, setFirstChapter] = useState(chapter + 1)
    const [firstItemIndex, setFirstItemIndex] = useState(id)
    const [count, setCount] = useState(0)
    const classes = useStyles()


    const makeNextIndex = (data) => {
        let indexData = []
        let z = 0
        for (let i = firstItemIndex; i < firstItemIndex + data.length; i++) {
            indexData.push({ index: i, data: data[z] })
            z++
        }
        return indexData
    }

    const makePreviousIndex = (data) => {
        let indexData = []
        let z = 0
        for (let i = firstItemIndex + data.length; i < firstItemIndex; i--) {
            indexData.push({ index: i, data: data[z] })
            z++
        }
        return indexData
    }

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


    const itemContent = (item, record) => {
        let data = record.data
        return (
            <Grid container className={classes.textLine} key={item}>
                <Grid item className={classes.text_he}>{data[BIBLE_HEBREW]}</Grid>
                <Grid item className={classes.verseNumber}>{data[BIBLE_VERSE]}</Grid>
                <Grid item className={classes.text_en}>{data[BIBLE_ENGLISH]}</Grid>
            </Grid>

        )
    }
    async function fetchPreviousData(item) {
        debugger
        console.log(item)
        let chapter = firstChapter - 1
        if (chapter <= 0) return

        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
        if (response.ok) {
            const data = await response.json()
            setBookData([...makePreviousIndex(data), ...bookData])
            setFirstItemIndex((firstItemIndex) => firstItemIndex - data.length)
            setFirstChapter(chapter)
            setCount((count) => count + data.length)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }
    async function fetchNextData(item) {
        debugger
        let chapter = lastChapter + 1
        if (chapter > totalChapters) return

        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
        if (response.ok) {
            const data = await response.json()
            setBookData([...bookData, ...makeNextIndex(data)])
            setLastChapter(chapter)
            setFirstItemIndex((firstItemIndex) => firstItemIndex + data.length)
            setCount((count) => count + data.length)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        fetchNextData()
    }, [])

    if (bookData.length === 0) {
        return null
    }

    return (
        <div className={classes.container}>
            <Grid container

            >
                <div className={classes.container}>
                    <Virtuoso data={bookData}

                        initialTopMostItemIndex={id-1}
                        // ref={virtuoso}
                        //totalCount={count}
                        firstItemIndex={firstItemIndex}
                        itemContent={itemContent}
                        startReached={fetchPreviousData}
                        // endReached={fetchNextData}
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

