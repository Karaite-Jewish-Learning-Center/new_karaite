import React, {useState, useEffect, useRef} from 'react'
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles'
import {bookChapterUrl, BOOK_DATA, BOOK_CHAPTERS} from '../constants/constants'
import {makeBookUrl} from '../utils/utils'
import ChapterHeaderVerse from '../components/biblicalChapter'
import './css/comments.css';
import Loading from "./Loading";
import PaneHeader from "./PaneHeader";
import {makeRandomKey} from "../utils/utils";

export default function BiblicalText({
                                         book,
                                         chapter,
                                         verse,
                                         highlight,
                                         fullBook,
                                         comment,
                                         onClosePane,
                                         onCommentOpen,
                                         paneNumber
                                     }) {

    console.log(book, chapter, verse)
    const [bookData, setBookData] = useState({});
    const [chapters, setChapters] = useState([])

    const virtuoso = useRef(null);
    const classes = useStyles()

    const itemContent = (item, data) => {
        return (
            <ChapterHeaderVerse item={item}
                                data={data}
                                highlight={highlight}
                                bookData={bookData}
                                onCommentOpen={onCommentOpen}
                                paneNumber={paneNumber}
                                comment={comment}
            />
        )
    }

const calculateIndex =(data)=>{
        return (fullBook ? data['verses'].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1 : verse - 1)
    }

    const getBook = async () => {
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, fullBook))
        if (response.ok) {
            const data = await response.json()
            setChapters(data[BOOK_CHAPTERS])
            setBookData(data[BOOK_DATA])
            const index = calculateIndex(data[BOOK_DATA])
            virtuoso.current.scrollToIndex({
                index: index,
                align: 'center',
            });
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getBook()
    }, [book, chapter, verse])


    return (
        <div className={classes.virtuoso} key={makeRandomKey}>
            <PaneHeader book={book} chapter={chapter} verse={verse} onClosePane={onClosePane}/>
            <Virtuoso data={chapters}
                      ref={virtuoso}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading text={(fullBook ? 'Book end.' : 'End of chapter.')}/>
                          }
                      }}
            />
        </div>
    )
}

const useStyles = makeStyles(() => ({
    virtuoso: {
        width: '100%',
        height: '100%',
        position: '',
    },

}))
