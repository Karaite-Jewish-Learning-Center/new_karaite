import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils";
import Loading from './Loading';
import { chaptersByBibleBook } from '../constants/constants'
import ChapterHeaderVerse from './ChapterHeaderVerse';
import Colors from '../constants/colors';
import { Typography } from '@material-ui/core';
import store from '../stores/BibleStore';
import { observer } from "mobx-react-lite";


const calculateChapter = (bookUtils, chapter) => {

    if (bookUtils.book['verses'].length <= 10) {
        return bookUtils.book['verses'].length
    }
    return parseInt(chapter) + 1
}

const CurrentChapter = observer(({ cc }) => (
    <Typography>{cc.currentChapter}</Typography>
))


export default function Bible({ book, chapter, verse, bookUtils, onCommentOpen, comments }) {

    const [currentChapter, setCurrentChapter] = useState(calculateChapter(bookUtils, chapter))
    const [loadingText, setLoadingText] = useState(null)
    const [bookData, setBookData] = useState(bookUtils.chapter)

    const classes = useStyles()
    const first = 1 // it's not the first time that we read data for this book

    const virtuoso = useRef(null);


    const itemContent = (item, data) => {
        return (
            <ChapterHeaderVerse item={item}
                data={data}
                highlight={[]}
                bookUtils={bookUtils.book}
                onCommentOpen={onCommentOpen}
                paneNumber={0}
                comment={comments}
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
    }, [])

    return (

        <div className={classes.container}>
            <div className={classes.header}>
                <CurrentChapter cc={store} />
            </div>
            <Virtuoso
                data={bookData}
                ref={virtuoso}
                endReached={fetchData}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return <Loading text={loadingText} />
                    }
                }}
            />
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        width: '100%',
        height: '100%',
        
    },
    header: {
        minHeight: 50,
        maxHeight: 50,
        width: '100%',
        backgroundColor: Colors['headerBackgroundColor'],
    },
}));

