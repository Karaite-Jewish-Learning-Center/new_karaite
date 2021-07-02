import React, {useState, useEffect} from "react";
import axios from 'axios';
import {Virtuoso} from 'react-virtuoso'
import Message from "./Message";
import {makeStyles} from '@material-ui/core/styles';
import {bookChapterUrl} from "../constants";
import Colors from "../constants/colors";
import Typography from '@material-ui/core/Typography';
import './css/comments.css';


export default function BiblicalText({book}) {
    const MAX_CHAPTERS_IN_BOOK_BIBLE = 149
    const BIBLE_ENGLISH = 0
    const BIBLE_HEBREW = 1
    const BIBLE_COMMENTS_ENGLISH = 2
    const BIBLE_COMMENTS_HEBREW = 3
    const BIBLE_VERSE = 4
    const [loading, setLoading] = useState('Loading...')
    const [error, setError] = useState(null)
    const [bookData, setBookData] = useState({
        book_title_en: "",
        book_title_he: "",
        chapters: 10,
        id: 0,
        verses: []
    });
    const [chapters, setChapters] = useState(new Array(MAX_CHAPTERS_IN_BOOK_BIBLE).fill(null))
    const [bookChapterVerse, setBookChapterVerse] = useState({book: book, chapter: 5, verse: 1})

    const classes = useStyles()

    const itemContent = (item, data) => {
        return (
            <div className={`${classes.textContainer} ${(bookChapterVerse.verse === data[BIBLE_VERSE] ? classes.selectVerse : '')}`}>
                <div className={classes.verseHe}>
                    <Typography lang="HE" dir="RTL">{data[BIBLE_HEBREW]}</Typography>
                </div>
                <div className={classes.verseNumber}>
                    <Typography>{data[BIBLE_VERSE]}</Typography>
                </div>
                <div className={classes.verseEn}>
                    <Typography>{data[BIBLE_ENGLISH]}</Typography>
                </div>
            </div>
        )
    }

    const getText = () => {
        let text = []
        for (let i = 0; i < chapters.length; i++) {
            if (chapters[i] !== null) {
                for (let x = 0; x < chapters[i].length; x++) {
                    text.push(chapters[i][x])
                }
            }
        }
        return text
    }
    const loadChapters = () => {
        let chapter = bookChapterVerse.chapter + 1
        if (chapter <= bookData.chapters) {
            axios.get(bookChapterUrl + `${bookChapterVerse.book}/${chapter}/`)
                .then((response) => {
                    setBookData(response.data.book)
                    let allChapters = chapters
                    allChapters[chapter - 1] = response.data.chapters[0]['text']
                    setChapters(allChapters)
                    setBookChapterVerse({book: book, chapter: chapter, verse: 1})
                })
                .catch(error => {
                    setError(error)
                    console.log(`Error on ${bookChapterUrl}: ${error.response}`)
                })
        } else {
            setLoading('Book end.')
        }
    }

    useEffect(() => {
        loadChapters()
    }, [])

    if (error) {
        return <Message error={error}/>
    } else {
        return (
            <div className={classes.container}>
                <Virtuoso data={getText()}
                          itemContent={itemContent}
                          // startReached={loadChapters}
                          endReached={loadChapters}
                          components={{
                              Footer: () => {
                                  return (
                                      <div
                                          style={{
                                              padding: '2rem',
                                              display: 'flex',
                                              justifyContent: 'center',
                                          }}
                                      >
                                          {loading}
                                      </div>
                                  )
                              }
                          }}
                />
            </div>
        )
    }
}


const useStyles = makeStyles((theme) => ({
    container: {
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 70,
    },
    textContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'top',
        borderBottom: '2px solid',
        MozBorderBottomColors: Colors['verseOnMouseOver'],
        borderBottomColor: Colors['verseOnMouseOver'],
    },
    verseHe: {
        maxWidth: '40%',
        minWidth: '40%',
        textAlign: 'right',
        verticalAlign: 'text-top',
        margin: 10,
        fontFamily: 'SBL Hebrew'
    },
    verseNumber: {
        margin: 10,
        maxWidth: '5%',
        minWidth: '5%',
        textAlign: 'center',
        verticalAlign: 'text-top',
    },
    verseEn: {
        maxWidth: '40%',
        minWidth: '40%',
        textAlign: 'left',
        verticalAlign: 'text-top',
        margin: 10
    },
    selectVerse: {
        backgroundColor: Colors['bibleSelectedVerse']
    },
    chapterNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'gray',
    },
}))