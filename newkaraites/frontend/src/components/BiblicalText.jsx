import React, {useState, useEffect, useRef} from "react";
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles';
import {bookChapterUrl, BOOK_DATA, BOOK_CHAPTERS} from "../constants/constants";
import {makeBookUrl} from "../utils/utils";
import ChapterHeader from '../components/biblicalChapter'
import './css/comments.css';
import Loading from "./Loading";


export default function BiblicalText({book, chapter, verse, fullBook}) {

    const [bookData, setBookData] = useState({});
    const [chapters, setChapters] = useState([])
    const [highlight, setHighLight] = useState(1)

    const virtuoso = useRef(null);
    const classes = useStyles()

    const itemContent = (item, data) => {
        return (
            <ChapterHeader item={item} data={data} highlight={highlight} bookData={bookData}/>
        )
    }

    const getBook = async () => {
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, fullBook))
        if (response.ok) {
            const data = await response.json()
            setChapters(data[BOOK_CHAPTERS])
            setBookData(data[BOOK_DATA])
            const i = data[1]['verses'].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1
            virtuoso.current.scrollToIndex({
                index: i,
                align: 'center',
            });
            setHighLight(i)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getBook()
    }, [])


    return (
        <div className={classes.container}>
            <Virtuoso data={chapters}
                      ref={virtuoso}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading style={classes.loading}/>
                          }
                      }}
            />
        </div>
    )
}

const useStyles = makeStyles(() => ({
    container: {
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 75,
    },
    loading: {
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
    }
}))
