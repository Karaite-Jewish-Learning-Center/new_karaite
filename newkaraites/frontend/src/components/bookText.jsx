import React, {useState, useEffect} from "react";
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core';
import ReactHtmlParser from 'react-html-parser';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import CommentBadge from '../components/CommentBadge';
import {hebrewToIndoArabic, hebrewBookNameToEnglish} from "../utils/utils";
import {bookChapterUrl, getCommentsUrl} from "../constants";
import './css/scroll.css';
import './css/comments.css';


function TabPanel(props) {
    const {children, value, index, ...other} = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box p={2}>
                <Typography>{children}</Typography>
            </Box>
        </div>
    );
}

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

    const scroll = () => {
        // let element = document.getElementById(`inner-${bookChapterVerse[CHAPTER]}-${bookChapterVerse[VERSE]}`)
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
        let book, chapter, verse
        let language = e.target.childNodes[0].parentElement.lang
        let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '')
        let [refBook, chapterVerse] = biblicalRef.split(" ")
        let [refChapter, refVerse] = chapterVerse.split(":")

        if (language === 'HE') {
            [book, chapter, verse] = [hebrewBookNameToEnglish(refBook), hebrewToIndoArabic(refChapter), hebrewToIndoArabic(refVerse)]
            debugger
        } else{
            [book, chapter, verse] = [refBook, refChapter, refVerse]
        }

        if(book === undefined || chapter === undefined || verse === undefined){
            console.log(refBook, refChapter, refChapter)
        }else {
            setBookChapterVerse([book, chapter, verse])
        }

    }

    function transform(node) {
        // rewrite the span with a onClick event handler
        if (node.type === 'tag' && node.name === 'span') {
            if (node['attribs']['class'] === 'en-biblical-ref') {
                return <span lang="EN" onClick={refClick} className="en-biblical-ref">{node['children'][0]['data']}</span>
            }
            if (node['attribs']['class'] === 'he-biblical-ref') {
                return <span lang="HE" onClick={refClick} className="he-biblical-ref">{node['children'][0]['data']}</span>
            }

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
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {

        return (
            <div>
                {/*<BooksToolBar className={classes.bookHeader}>*/}
                {/*    <p>{book}, {chapter} , {verse}</p>*/}
                {/*</BooksToolBar>*/}
                <Grid container
                      className={classes.root}
                >
                    <Grid item xs={gridsize[0]}>
                        <div className={classes.textHeader}>
                            Header
                        </div>
                        <Table className="scroll_table">
                            <TableBody>
                                {bookChapters.map((chapter_text, c) => (
                                    <>
                                        {chapter_text.text.map((verse, v) => (
                                            <TableRow id={`inner-1-${v + 1}`} key={`inner-${c}-${v}`}
                                                      hover={true}
                                                      selected={(v + 1) === bookChapterVerse[VERSE]}
                                                      className={(v + 1 === bookChapterVerse[VERSE] ? classes.selectColor : "")}
                                            >

                                                <TableCell key={`${c}-${v}-1`} className={classes.text}>
                                                    <Typography
                                                        lang="he"
                                                        key={`he-${c}-${v}`}
                                                        dir="RTL">
                                                        {verse[1]}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell id={`pos-${c + 1}-${v + 1}`} key={`${c}-${v}-2`} className={classes.verseNumber}>
                                                    <Typography className={classes.count}>
                                                        {v + 1}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell key={`${c}-${v}-3`} className={classes.text}>
                                                    <Typography lang="en"
                                                                key={`en-${c}-${v}`}
                                                                dir="LTR">{verse[0]}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell key={`${c}-${v}-4`} data-c-v={`${c},${v}`} className={(verse[2] !== '0' ? classes.comments : '')}
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
                        <Grid Grid item xs={gridsize[1]}>
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
                                    {comments.map(html => (
                                        <>
                                            {ReactHtmlParser(html.comment_en, {
                                                decodeEntities: true,
                                                transform: transform
                                            })}

                                        </>
                                    ))}
                                </TabPanel>
                                <TabPanel value={commentTab} index={1}>
                                    {comments.map(html => (
                                        <>
                                            {ReactHtmlParser(html.comment_he, {
                                                decodeEntities: true,
                                                transform: transform
                                            })}
                                        </>
                                    ))}
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
        marginTop: 100,
        marginBottom: 100,

    },

    table: {
        padding: '30px',
    },
    text: {
        width: "45%",
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
        backgroundColor: '#96c5f3'
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
    textHeader: {
        minHeight: 50,
        backgroundColor: '#eaeaea',

    }
}))


