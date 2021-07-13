import React, {useState, useEffect, useRef} from 'react'
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles'
import {bookChapterUrl, BOOK_DATA, BOOK_CHAPTERS} from '../constants/constants'
import {makeBookUrl} from '../utils/utils'
import ChapterHeaderVerse from '../components/biblicalChapter'

import './css/comments.css';
import Loading from "./Loading";
import PaneHeader from "./PaneHeader";


export default function BiblicalText({book, chapter, verse, fullBook}) {

    const [bookData, setBookData] = useState({});
    const [chapters, setChapters] = useState([])
    const [highlight, setHighLight] = useState(1)

    const virtuoso = useRef(null);
    const classes = useStyles()

    const itemContent = (item, data) => {
        return (
            <ChapterHeaderVerse item={item} data={data} highlight={highlight} bookData={bookData}/>
        )
    }

    const calculateIndex =(data)=>{
        return (fullBook? data['verses'].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1:  verse-1 )
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
            setHighLight(index)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getBook()
    }, [])


    return (
        <div className={classes.virtuoso}>
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
        position:'',
    },

}))
