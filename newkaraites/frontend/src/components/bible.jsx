import React, { useState, useEffect, useRef } from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import CommentsPane from "./CommentPane";
import { getCommentsUrl } from "../constants/constants";
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils";
import Loading from './Loading';
import { chaptersByBibleBook } from '../constants/constants'
import ChapterHeaderVerse from './biblicalChapter';



const calculateChapter = (bookUtils, chapter) => {

    if (bookUtils.book['verses'].length <= 10) {
        return bookUtils.book['verses'].length
    }
    return parseInt(chapter) + 1
}


export default function Bible({ book, chapter, verse, bookUtils }) {
    const [comments, setComments] = useState([])
    const [commentChapter, setCommentChapter] = useState(0)
    const [commentVerse, setCommentVerse] = useState(0)
    const [currentChapter, setCurrentChapter] = useState(calculateChapter(bookUtils, chapter))
    const [loadingText, setLoadingText] = useState(null)
    const [bookData, setBookData] = useState(bookUtils.chapter)
    const first = 1 // it's not the first time that we read data for this book
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
            <ChapterHeaderVerse item={item}
                data={data}
                highlight={0}
                bookUtils={bookUtils.book}
                onCommentOpen={onCommentOpen}
                paneNumber={0}
                comment={[]}
            />
        )
    }

    async function fetchData() {
        if (currentChapter <= chaptersByBibleBook[book]) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, currentChapter, first, false))
            if (response.ok) {
                const data = await response.json()
                setBookData([...bookData, ...data.chapter])
                setCurrentChapter((currentChapter) => currentChapter + 1)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        } else {
            setLoadingText('End of book.')
        }
    }

    const jump = () => {
        virtuoso.current.scrollToIndex({
            index: bookUtils.book['verses'].slice(0, currentChapter - 2).reduce((x, y) => x + y, 0) + verse - 1,
            align: 'center',
        });
    }
    useEffect(() => {
        setTimeout(() => {
            jump()
        }, 30);
    }, [bookData])


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
        height: 'calc(80vh - 70px)',
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
