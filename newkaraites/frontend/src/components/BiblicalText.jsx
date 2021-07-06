import React, {useState, useEffect, useRef} from "react";
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles';
import {bookChapterUrl} from "../constants";
import Colors from "../constants/colors";
import Typography from '@material-ui/core/Typography';
import './css/comments.css';
import Loading from "./Loading";


export default function BiblicalText({book, chapter, verse}) {
    const BIBLE_ENGLISH = 0
    const BIBLE_HEBREW = 1
    const BIBLE_VERSE = 4
    const BIBLE_CHAPTER = 5
    const [bookData, setBookData] = useState({});
    const [chapters, setChapters] = useState([])
    const [highlight, setHighLight] = useState(1)

    const virtuoso = useRef(null);
    const classes = useStyles()

    const itemContent = (item, data) => {
        let chapterHtml = null
        let chapter = data[BIBLE_CHAPTER]
        if (chapter !== "0") {
            if (chapter === "1") {
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
            <div>
                {chapterHtml}
                <div className={`${classes.textContainer} ${(highlight === item ? classes.selectVerse : '')}`}>
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
            </div>
        )
    }

    const getBook = async () => {
        const response = await fetch(bookChapterUrl + `${book}/`)
        if (response.ok) {
            let data = await response.json()
            setBookData(data[1])
            setChapters(data[0])
            let i = data[1].verses.slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1
            virtuoso.current.scrollToIndex({
                index: i,
                align:'center',
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
                              return (
                                  <div
                                      style={{
                                          padding: '2rem',
                                          display: 'flex',
                                          justifyContent: 'center',
                                      }}
                                  >
                                      <Loading/>
                                  </div>
                              )
                          }
                      }}
            />
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 75,
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