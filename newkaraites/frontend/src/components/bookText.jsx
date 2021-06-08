import React, {useReducer} from "react";
import {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Badge from '@material-ui/core/Badge';
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core';
import ReactHtmlParser from 'react-html-parser';
import CommentTwoToneIcon from '@material-ui/icons/CommentTwoTone';
import BooksToolBar from "./css/BooksToolbar";
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import {bookChapterUrl, getCommentsUrl} from "../constants";
import './css/scroll.css';
import './css/comments.css';


const useStyles = makeStyles({
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
    }
})


export default function BookText({book}) {
    const BOOK = 0
    const CHAPTER = 1
    const VERSE = 2
    const COM_CHAPTER = 0
    const COM_VERSE = 1
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState();
    const [bookChapters, setBookChapters] = useState()
    const [gridsize, setGridSize] = useState([12, 1])
    const [comments, setComments] = useState([])
    const [bookChapterVerse, setBookChapterVerse] = useState([book, 1, 1])
    const [commentChapterVerse, setCommentChapterVerse] = useState([0, 0])

    const classes = useStyles();

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
        let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '')
        let [book, chapterVerse] = biblicalRef.split(" ")
        let [chapter, verse] = chapterVerse.split(":")
        setBookChapterVerse([book, chapter, verse])
    }

    function transform(node) {
        // rewrite the span with a onClick event handler
        if (node.type === 'tag' && node.name === 'span') {
            if (node['attribs']['class'] === 'biblical-link') {
                return <span onClick={refClick} className="biblical-link">{node['children'][0]['data']}</span>
            }
        }
    }

    const rowOnclick = (e) => {
        let [chapter, verse] = e.currentTarget.dataset.cV.split(',')
        chapter = parseInt(chapter) + 1
        verse = parseInt(verse) + 1
        // toggle comments
        if (gridsize[0] === 8 && bookChapterVerse[CHAPTER] === chapter && bookChapterVerse[VERSE] === verse) {
            setGridSize([12, 1])
            return
        }

        axios.get(getCommentsUrl + `${bookChapterVerse[BOOK]}/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments)
                setBookChapterVerse([bookChapterVerse[BOOK], chapter, verse])
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
                debugger
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
        const {chapters} = bookChapters
        debugger
        const [book, chapter, verse] = bookChapterVerse

        return (
            <div>
                {/*<BooksToolBar className={classes.bookHeader}>*/}
                {/*    <p>{book}, {chapter} , {verse}</p>*/}
                {/*</BooksToolBar>*/}
                <Grid container
                      className={classes.root}

                >

                    {/*<ReactTooltip className={classes.toolTipMax} place="bottom"/>*/}
                    <Grid item xs={gridsize[0]}>
                        <Table className="scroll_table">
                            <TableBody>
                                {[].map((chapter_text, c) => (
                                    <>
                                        {chapter_text.text.map((verse, v) => (
                                            <TableRow id={`inner-1-${v + 1}`} key={`inner-${c}-${v}`}
                                                      hover={true}
                                                      selected={(v + 1) === bookChapterVerse[VERSE]}
                                                      className={(v + 1 === bookChapterVerse[VERSE] ? classes.selectColor : "")}
                                            >

                                                <TableCell key={`${c}-${v}-1`} className={classes.text}>
                                                    <Typography
                                                        align="right"
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
                                                    {(verse[2] !== '0' ?
                                                        <span data-tip={"Click to read " + (verse[2] === "1" ? 'this comment' : 'these comments')}>
                                                    <Badge badgeContent={verse[2]} color={((commentChapterVerse[COM_CHAPTER] === c + 1 && commentChapterVerse[COM_VERSE] === v + 1) ? "secondary" : "primary")}>
                                                            <CommentTwoToneIcon/>
                                                        </Badge>
                                                    </span>
                                                        : null)}
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
                            <div className="div_scroll">
                                {comments.map(html => (
                                    <>
                                        {ReactHtmlParser(html.comment_en, {
                                            decodeEntities: true,
                                            transform: transform
                                        })}
                                    </>
                                ))}
                            </div>
                        </Grid>
                        : null)}
                </Grid>
            </div>
        )
    }
}