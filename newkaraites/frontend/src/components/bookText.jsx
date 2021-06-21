import React, {useState, useEffect} from "react";
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';

import TabPanel from "./TabPanel";
import Message from "./Message";
import CommentBadge from '../components/CommentBadge';
import SelectChapter from '../components/SelectChapter';
import Comments from "./Coments";
import {hebrewToIndoArabic, hebrewBookNameToEnglish, makeRandomKey} from "../utils/utils";
import {bookChapterUrl, getCommentsUrl} from "../constants";
import './css/scroll.css';
import './css/comments.css';


export default function BookText({book}) {
    const BOOK = 0
    const CHAPTER = 1
    const VERSE = 2
    const COM_CHAPTER = 0
    const COM_VERSE = 1
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState();
    const [bookChapters, setBookChapters] = useState([])
    const [gridsize, setGridSize] = useState([12, 1])
    const [comments, setComments] = useState([])
    const [bookChapterVerse, setBookChapterVerse] = useState([book, 1, 1])
    const [commentChapterVerse, setCommentChapterVerse] = useState([0, 0])
    const [commentTab, setCommentTab] = useState(0)

    const classes = useStyles();

    const onTabChange = (event, tab) => {
        setCommentTab(tab)
    }

    const onChapterChange = (e) => {
        setBookChapterVerse([bookChapterVerse[BOOK], e.target.value, 1])
    }
    const scroll = () => {
        let element = document.getElementById(`inner-1-${bookChapterVerse[VERSE]}`)
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
        let language = e.target.childNodes[0].parentElement.lang
        let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(',', '').replace('.', '').trim()
        if (language === 'HE') {
            let spacePos = biblicalRef.lastIndexOf(' ') + 1
            let refChapterVerse = biblicalRef.substr(spacePos)
            let [refChapter, refVerse] = refChapterVerse.split(':')
            let refBook = biblicalRef.replace(refChapterVerse, '').trim()
            refVerse = refVerse.split('-')
            book = hebrewBookNameToEnglish(refBook)
            chapter = hebrewToIndoArabic(refChapter)
            verse = hebrewToIndoArabic(refVerse[0])
        } else {
            let re = /[0-9]+/g
            let chapterVerse = biblicalRef.match(re)
            chapter = parseInt(chapterVerse[0])
            verse = parseInt(chapterVerse[1])
            re = /[a-z,A-Z]+/g
            book = biblicalRef.match(re)
        }

        if ((book !== undefined && chapter !== undefined && verse !== undefined)) {
            setBookChapterVerse([book, chapter, verse])
        } else {
            console.log(book, chapter, verse)
        }

    }
    const rowOnclick = (e) => {
        let [chapter, verse] = e.currentTarget.dataset.cV.split(',')
        chapter = parseInt(chapter) + 1
        verse = parseInt(verse) + 1
        let isCommentLoaded = commentChapterVerse[COM_CHAPTER] === chapter && commentChapterVerse[COM_VERSE] === verse
        // avoid multiple calls to same comment
        if (isCommentLoaded) {
            // open tab if closed
            if (gridsize[0] === 12) {
                setGridSize([8, 4])
                return
            }
            return
        }

        axios.get(getCommentsUrl + `${bookChapterVerse[BOOK]}/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments)
                setCommentChapterVerse([chapter, verse])
                setGridSize([8, 4])
                ReactTooltip.rebuild()

            })
            .catch(error => {
                console.log(`Error on ${getCommentsUrl}: ${error}`)
            })
    }

    useEffect(() => {

        axios.get(bookChapterUrl + `${bookChapterVerse[BOOK]}/${bookChapterVerse[CHAPTER]}/`)
            .then((response) => {
                setBookData(response.data.book);
                setBookChapters(response.data.chapters)
                setCommentChapterVerse([0, 0])
                setIsLoaded(true);
                ReactTooltip.rebuild()
                scroll()
            })
            .catch(error => {
                setError(error)
                console.log(`Error on ${bookChapterUrl}: ${error.response}`)
            })
    }, [bookChapterVerse])

    if (error) {
        return <Message error={error}/>
    } else {
        return (
            <div>
                <Grid container className={classes.root}>
                    <Grid item xs={gridsize[0]}>

                        <SelectChapter book={bookData}
                                       chapter={bookChapterVerse[CHAPTER]}
                                       onSelectChange={onChapterChange}
                                       isloaded={isLoaded}
                        />

                        <Table className="scroll_table">
                            <TableHead>
                            <TableRow/>
                            </TableHead>
                            <TableBody>
                                {bookChapters.map((chapter_text, c) => (
                                    <>
                                        {chapter_text.text.map((verse, v) => (
                                            <TableRow key={makeRandomKey()}
                                                      id={`inner-1-${v + 1}`}
                                                      hover={true}
                                                      selected={(v + 1) === bookChapterVerse[VERSE]}

                                            >

                                                <TableCell className={classes.textHe}>
                                                    <Typography
                                                        lang="he"
                                                        key={`he-${c}-${v}`}
                                                        dir="RTL">
                                                        {verse[1]}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell id={`pos-${c + 1}-${v + 1}`} className={classes.verseNumber}>
                                                    <Typography className={classes.count}>
                                                        {v + 1}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell className={classes.text}>
                                                    <Typography lang="en"
                                                                key={`en-${c}-${v}`}
                                                                dir="LTR">{verse[0]}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell data-c-v={`${c},${v}`} className={(verse[2] !== '0' ? classes.comments : '')}
                                                           onClick={(verse[2] !== '0' ? rowOnclick : null)}
                                                >
                                                    <CommentBadge commentsCount={verse[2]} sameChapterAndVerse={(commentChapterVerse[COM_CHAPTER] === c + 1 && commentChapterVerse[COM_VERSE] === v + 1)}/>

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
                            <div className={classes.resources}>
                                <IconButton
                                    aria-label="Close comments pane"
                                    component="span"
                                    onClick={() => (setGridSize([12, 1]))}
                                >
                                    <HighlightOffIcon/>
                                </IconButton>
                            </div>
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
    text: {
        width: "45%",
        verticalAlign: 'text-top',
    },
    textHe: {
        width: "45%",
        textAlign: 'right',
        verticalAlign: 'text-top',
    },
    verseNumber: {
        width: "5%",
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


