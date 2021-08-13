import React, { useState, useEffect, useRef } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import CommentsPane from "./CommentPane";
import { getCommentsUrl } from "../constants/constants";
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils";
import Loading from './Loading';
import { BIBLE_ENGLISH, BIBLE_HEBREW, BIBLE_VERSE } from '../constants/constants'
import { chaptersByBibleBook } from '../constants/constants'


export default function BibleBooksWithComments({ book, chapter, verse }) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [bookUtils, setBookUtils] = useState(null)
    const [currentChapter, setCurrentChapter] = useState(chapter)
    const [loadingText, setLoadingText] = useState(null)
    const [first, setFirst] = useState(0)
    const [bookData, setBookData] = useState([])
    const classes = useStyles()

    const virtuoso = useRef(null);

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

    async function fetchData() {
        if (currentChapter <= chaptersByBibleBook[book]) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, currentChapter, first, false))
            if (response.ok) {
                const data = await response.json()
                setBookData([...bookData, ...data.chapter])
                setBookUtils(data.book)
                setCurrentChapter((currentChapter) => currentChapter + 1)
                setFirst(1)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        } else {
            setLoadingText('End of book.')
        }
    }

    const calculateIndex = () => {
        return [9, 25, 5, 19, 15, 11, 16, 14, 17, 15, 11, 15, 15, 10].slice(0, currentChapter - 1).reduce((x, y) => x + y, 0) + verse - 1
    }



    useEffect(() => {
        return fetchData()

        // if (virtuoso.current !== null) {
        //     let i = calculateIndex()
        //     console.log('index', i)
        //     virtuoso.current.scrollToIndex({
        //         index: i,
        //         align: 'center',
        //     });
        // }
    }, [])

    // if (virtuoso.current !== null) {
    //     let i = calculateIndex()
    //     console.log('index', i)
    //     virtuoso.current.scrollToIndex({
    //         index: i,
    //         align: 'center',
    //     });
    // }
    if (bookData.length === 0) {
        return null
    }
    return (
        <div className={classes.container}>
            <Grid container>
                <div className={classes.container}>
                    <Virtuoso data={bookData}
                        ref={virtuoso}
                        endReached={fetchData}
                        itemContent={itemContent}
                        components={{
                            Footer: () => {
                                return <Loading text={loadingText} />
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
