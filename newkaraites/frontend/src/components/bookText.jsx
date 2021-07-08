import React, {useState, useEffect} from "react";
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

import TabPanel from "./TabPanel";
import Message from "./Message";
import CommentBadge from '../components/CommentBadge';
import Comments from "./Coments";
import CommentRef from "./commenstRef";
import {
    hebrewToIndoArabic,
    hebrewBookNameToEnglish,
    makeRandomKey,
    englishBookNameToHebrew,
    toEnglish,
    equals
} from "../utils/utils";
import {bookChapterUrlOld, getCommentsUrl} from "../constants/constants";
import './css/scroll.css';
import './css/comments.css';
import HeaderSelect from "./HeaderSelect";
const useStyles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
        flexGrow: 1,
        marginTop: 70,
        marginBottom: 100,

    },
    table: {
        padding: '30px',
    },
    tableHeader: {
        width: '100%',
    },
    textWidth: {
        width: "45%",
    },
    text: {
        verticalAlign: 'text-top',
    },
    textHe: {
        textAlign: 'right',
        verticalAlign: 'text-top',
    },
    hebrewFont: {
        fontFamily: 'SBL Hebrew',
    },
    verseWidth: {
        width: "5%",
    },
    verseNumber: {
        verticalAlign: 'text-top',
    },
    count: {
        fontSize: '0.9em',
        color: 'gray',
        textAlign: 'center'
    },
    header: {
        width: '50%',
        textAlign: 'left'
    },
    comments: {
        cursor: 'pointer',
    },

    selectColor: {
        backgroundColor: '#0980f5'
    },
    bookHeader: {
        position: 'relative',
        width: '100%',
        height: 30,
        backgroundColor: "gray",
        color: 'black',
    },
    resources: {
        minHeight: 50,
        backgroundColor: '#eaeaea',
        borderLeft: '1px solid darkgrey',
    },


}))






export default function BookText({book}) {
    const BOOK = 0
    const CHAPTER = 1
    const VERSE = 2
    const classes = useStyles();
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState();
    const [bookChapters, setBookChapters] = useState([])
    const [gridsize, setGridSize] = useState([12, 1])
    const [comments, setComments] = useState([])
    const [bookChapterVerse, setBookChapterVerse] = useState([book, 1, 1])
    const [commentBookChapterVerse, setCommentBookChapterVerse] = useState([book, 0, 0])
    const [commentTab, setCommentTab] = useState(0)
    const [verseRange, setVerseRange] = useState([1])


    const onTabChange = (event, tab) => {
        setCommentTab(tab)
        ReactTooltip.rebuild()
    }
    const onChapterChange = (e) => {
        setIsLoaded(false)
        setBookChapterVerse([bookChapterVerse[BOOK], parseInt(e.target.value), 1])
        setVerseRange([1])
    }
    const onBookChange = (e) => {
        setIsLoaded(false)
        setBookChapterVerse([toEnglish(e.target.value), 1, 1])
        setVerseRange([1])
    }
    const closeCommentTab = () => {
        setGridSize([12, 1])
        ReactTooltip.hide()
        ReactTooltip.rebuild()
    }
    const openCommentTab = () => {

        setGridSize([8, 4])
        ReactTooltip.hide()
        ReactTooltip.rebuild()
    }
    const scroll = () => {
        let element = document.getElementById(`inner-${bookChapterVerse[CHAPTER]}-${bookChapterVerse[VERSE]}`)
        if (element !== null) {
            let bounding = element.getBoundingClientRect()
            if (!(bounding.top >= 0 && bounding.left >= 0 && bounding.right <= window.innerWidth && bounding.bottom <= window.innerHeight)) {
                element.scrollIntoView()
            }
        }
    }
    const refClick = (e) => {
        // parse biblical ref
        let book
        let chapter
        let verse
        let chapterVerse
        let language = e.target.childNodes[0].parentElement.lang
        let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(',', '').replace('.', '').trim()
        if (language.toLowerCase() === 'he') {
            debugger
            let spacePos = biblicalRef.lastIndexOf(' ') + 1
            let refChapterVerse = biblicalRef.substr(spacePos)
            let [refChapter, refVerse] = refChapterVerse.split(':')
            let refBook = biblicalRef.replace(refChapterVerse, '').trim()
            refVerse = refVerse.split('-')
            book = hebrewBookNameToEnglish(refBook)
            chapter = hebrewToIndoArabic(refChapter)
            verse = hebrewToIndoArabic(refVerse[0])
            chapterVerse = refVerse.map(hebrewNumber => hebrewToIndoArabic(hebrewNumber))
        } else {
            debugger
            let re = /[0-9]+/g
            chapterVerse = biblicalRef.match(re)
            chapter = parseInt(chapterVerse[0])
            verse = parseInt(chapterVerse[1])
            re = /[a-z,A-Z]+/g
            book = biblicalRef.match(re)[0]
            chapterVerse = chapterVerse.slice(1).map(arabic => parseInt(arabic))
        }

        if ((book !== undefined && chapter !== undefined && verse !== undefined)) {
            setBookChapterVerse([book, chapter, verse])
            setVerseRange(chapterVerse)
        } else {
            console.log(book, chapter, verse)
        }

    }
    const rowOnclick = (e) => {

        let [chapter, verse] = e.currentTarget.dataset.cV.split(',')
        chapter = parseInt(chapter)
        verse = parseInt(verse) + 1
        debugger
        let isCommentLoaded = commentBookChapterVerse[CHAPTER] === chapter && commentBookChapterVerse[VERSE] === verse
        // avoid multiple calls to same comment
        if (isCommentLoaded) {
            // open tab if closed
            if (gridsize[0] === 12) {
                openCommentTab()
                // setGridSize([8, 4])
                return
            }
            return
        }

        axios.get(getCommentsUrl + `${bookChapterVerse[BOOK]}/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments)
                setCommentBookChapterVerse([bookChapterVerse[BOOK], chapter, verse])
                // setGridSize([8, 4])
                // ReactTooltip.hide()
                // ReactTooltip.rebuild()
                openCommentTab()
            })
            .catch(error => {
                console.log(`Error on ${getCommentsUrl}: ${error}`)
            })
    }

    useEffect(() => {
        axios.get(bookChapterUrlOld + `${bookChapterVerse[BOOK]}/${bookChapterVerse[CHAPTER]}/`)
            .then((response) => {
                setBookData(response.data.book);
                setBookChapters(response.data.chapters)
                debugger
                // setBookChapters({[bookChapterVerse[BOOK]]: response.data.chapters})
                setIsLoaded(true);
                ReactTooltip.rebuild()
                scroll()
            })
            .catch(error => {
                setError(error)
                console.log(`Error on ${bookChapterUrlOld}: ${error.response}`)
            })
    }, [bookChapterVerse])

    if (!isLoaded) return (<div>Loading</div>)

    if (error) {
        return <Message error={error}/>
    } else {
        const bookName = bookChapterVerse[BOOK]
        const chapter = bookChapterVerse[CHAPTER]
        debugger
        return (
            <div>
                <Grid container className={classes.root}>
                    <Grid item xs={gridsize[0]}>


                        <Table stickyHeader aria-label="sticky table" className="scroll_table">
                            <TableHead>
                                <TableRow>
                                    <HeaderSelect book_en={bookName}
                                                  book_he={englishBookNameToHebrew(bookName)}
                                                  chapters={bookData.verses.length}
                                                  chapter={chapter}
                                                  onSelectChangeChapter={onChapterChange}
                                                  onSelectChangeBook={onBookChange}
                                                  isloaded={isLoaded}/>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookChapters.map((chapter_text, c) => (
                                    <>
                                        {chapter_text.text.map((verse, v) => (
                                            <TableRow key={makeRandomKey()}
                                                      id={`inner-${chapter}-${v + 1}`}
                                                      hover={true}
                                                      selected={verseRange.includes(v + 1)}

                                            >

                                                <TableCell className={`${classes.textHe} ${classes.textWidth}`}>
                                                    <Typography
                                                        className={classes.hebrewFont}
                                                        lang="he"
                                                        key={`he-${chapter}-${v}`}
                                                        dir="RTL">
                                                        {verse[1]}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell id={`pos-${chapter}-${v + 1}`} className={`${classes.verseNumber} ${classes.verseWidth}`}>
                                                    <Typography className={classes.count}>
                                                        {v + 1}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell className={`${classes.text} ${classes.textWidth}`}>


                                                    <Typography lang="en"
                                                                key={`en-${chapter}-${v}`}
                                                                dir="LTR">{verse[0]}
                                                    </Typography>


                                                </TableCell>

                                                <TableCell data-c-v={`${chapter},${v}`} className={(verse[2] !== '0' ? classes.comments : '')}
                                                           onClick={(verse[2] !== '0' ? rowOnclick : null)}
                                                >
                                                    <CommentBadge commentsCount={verse[2]} sameChapterAndVerse={equals(commentBookChapterVerse, [bookName, c + chapter, v + 1])}/>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid>
                    {(comments.length > 0 ?
                        <Grid item xs={gridsize[1]}>
                            <CommentRef book={commentBookChapterVerse[BOOK]}
                                        chapter={commentBookChapterVerse[CHAPTER]}
                                        verse={commentBookChapterVerse[VERSE]}
                                        language={commentTab}
                                        closeCommentTabHandler={closeCommentTab}
                                        biblicalRef={refClick}
                            />
                            <div className="div_scroll">
                                <Tabs
                                    value={commentTab}
                                    onChange={onTabChange}
                                    className={classes.tabs}
                                    aria-label="comments English Hebrew">
                                    <Tab label="English" id={0} aria-label="Comments in English"/>
                                    <Tab label="Hebrew" id={1} aria-label="Comments in Hebrew"/>
                                </Tabs>

                                <TabPanel value={commentTab} index={0}>
                                    <Comments language="en" comments={comments} refClick={refClick}/>
                                </TabPanel>
                                <TabPanel value={commentTab} index={1}>
                                    <Comments language="he" comments={comments} refClick={refClick}/>
                                </TabPanel>
                            </div>
                        </Grid>
                        : null)}
                </Grid>
            </div>
        )
    }
}
