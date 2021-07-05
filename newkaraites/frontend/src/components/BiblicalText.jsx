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
    const BIBLE_CHAPTER = 5
    const [firstItem, setFirstItem] = useState(0)
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
    const [bookChapterVerse, setBookChapterVerse] = useState({book: book, chapter: 5, verse: 0})
    const classes = useStyles()

    const itemContent = (item, data) => {
        let chapterHtml = null
        let chapter = data[BIBLE_CHAPTER]
        if (chapter !== 0 ) {
            if(chapter===1) {
                chapterHtml = (<div className={classes.chapter}>
                    <div className={classes.chapterTitle_he}>
                        <Typography className={`${classes.he} ${classes.hebrewFont}`}>{bookData.book_title_he}</Typography>
                    </div>
                    <div className={classes.chapterNumber}>
                        <Typography className={classes.ch}>{chapter}</Typography>
                    </div>
                    <div className={classes.chapterTitle_en}>
                        <Typography className={classes.en}>{bookData.book_title_en}</Typography>
                    </div>

                </div>)
            } else {
                chapterHtml = (<div className={classes.chapter}>
                    <div className={classes.chapterNumber}>
                        <Typography className={classes.ch}>{chapter}</Typography>
                        <hr/>
                    </div>
                </div>)
            }
        }
        return (
            <div className={`${classes.textContainer} ${(bookChapterVerse.verse === data[BIBLE_VERSE] ? classes.selectVerse : '')}`}
            >
                {chapterHtml}
                <div className={classes.verseHe}>
                    <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                </div>
                <div className={classes.verseNumber}>
                    <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
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
                    let tmp = chapters[i][x]
                    tmp.push((x === 0 ? i +1 : 0))
                    text.push(tmp)
                }
            }
        }
        return text
    }
    const previousChapter = () => {
        let {book, chapter, verse} = bookChapterVerse
        --chapter
        if (chapters[chapter] === null && chapter >= 1) {
            axios.get(bookChapterUrl + `${book}/${chapter}`)
                .then((response) => {
                    setBookData(response.data.book)
                    let allChapters = chapters
                    allChapters[chapter - 1] = response.data.chapters[0]['text']
                    setChapters(allChapters)
                    setBookChapterVerse({book: book, chapter: chapter, verse: verse})
                })
                .catch(error => {
                    setError(error)
                    console.log(`Error on ${bookChapterUrl}: ${error.response}`)
                })

        } else {
            setLoading('Book begin.')
        }
    }

    const loadChapters = () => {
        let {book, chapter, verse} = bookChapterVerse
        ++chapter
        if (chapters[chapter] === null && chapter <= bookData['chapters']) {
            axios.get(bookChapterUrl + `${book}/${chapter}/`)
                .then((response) => {
                    setBookData(response.data.book)
                    let allChapters = chapters
                    allChapters[chapter - 1] = response.data.chapters[0]['text']
                    setChapters(allChapters)
                    setBookChapterVerse({book: book, chapter: chapter, verse: verse})
                })
                .catch(error => {
                    setError(error)
                    console.log(`Error on ${bookChapterUrl}: ${error.response}`)
                })
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
                          firstItemIndex={0}
                          initialTopMostItemIndex={0}
                          itemContent={itemContent}
                          startReached={previousChapter}
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
        // borderBottom: '2px solid',
        // MozBorderBottomColors: Colors['verseOnMouseOver'],
        // borderBottomColor: Colors['verseOnMouseOver'],
    },
    chapter: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chapterTitle_he: {
        maxWidth: '40%',
        minWidth: '40%',
        margin: 10,
    },
    he: {
        fontSize: 22,
        direction: 'RTL',
        textDecoration: 'underline',
        textDecorationColor: Colors['underline'],
    },
    en: {
        fontSize: 22,
        textDecoration: 'underline',
        textDecorationColor: Colors['underline'],
    },
    ch: {
        fontSize: 18,
        color: 'gray',
    },
    chapterTitle_en: {
        maxWidth: '40%',
        minWidth: '40%',
        margin: 10,
    },
    chapterNumber: {
        maxWidth: '5%',
        minWidth: '5%',
        margin: 10,
        textAlign: 'center',
        verticalAlign: 'text-top',
        fontSize: 20,
        color: 'gray'
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
    vn: {
        fontSize: 12,
        color: Colors['gray']
    },
    verseEn: {
        maxWidth: '40%',
        minWidth: '40%',
        textAlign: 'left',
        verticalAlign: 'text-top',
        margin: 10
    },
    hebrewFont: {
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
    },
    selectVerse: {
        backgroundColor: Colors['bibleSelectedVerse']
    },
}))