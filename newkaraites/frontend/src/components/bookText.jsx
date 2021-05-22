import React from "react";
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
import axios from 'axios';
import ReactTooltip from 'react-tooltip';
import {bookChapterUrl, getCommentsUrl} from "../constants";
import './css/scroll.css';
import './css/comments.css';


const useStyles = makeStyles({
    root: {
        flexGrow: 1,
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
    cc: {
        width: 'auto',
        height: 'auto',

    },
    toolMax: {
        maxWidth: 300,
    }
})

export default function BookText() {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState([]);
    const [gridsize, setGridSize] = useState([12, 1])
    const [comments, setComments] = useState([])
    const [chapterVerse, setChapterVerse] = useState([])

    const classes = useStyles();

    const rowOnclick = (e) => {
        let [chapter, verse] = e.currentTarget.dataset.cV.split(',')
        chapter = parseInt(chapter) + 1
        verse = parseInt(verse) + 1
        // toggle comments
        if (gridsize[0] === 8 && chapterVerse[0] === chapter && chapterVerse[1] === verse) {
            setGridSize([12, 1])
            return
        }

        axios.get(getCommentsUrl + `Deuteronomy/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments)
                setChapterVerse([chapter, verse])
                setGridSize([8, 4])
                ReactTooltip.rebuild()
            })
            .catch(error => {
                console.log(`Error on ${getCommentsUrl}: ${error}`)
            })
    }

    useEffect(() => {
        axios.get(bookChapterUrl + 'Deuteronomy/1/')
            .then((response) => {
                setBookData(response.data);
                setIsLoaded(true);
            })
            .catch(error => {
                setError(error)
                console.log(`Error on ${bookChapterUrl}: ${error.response.data.message}`)
            })
    }, [])
    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        const chapters = bookData.chapters
        return (
            <Grid container
                  className={classes.root}
                  alignItems="baseline"
            >

                <ReactTooltip className={classes.toolMax} place="bottom"/>
                <Grid item xs={gridsize[0]}>
                    <Table className="scroll_table">
                        <TableBody>
                            {chapters.map((chapter, c) => (
                                <>

                                    {chapter.text.map((verse, v) => (
                                        <TableRow key={`inner-${c}-${v}`}
                                                  hover={true}

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

                                            <TableCell key={`${c}-${v}-2`} className={classes.verseNumber}>
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
                                                        <Badge badgeContent={verse[2]} color={((chapterVerse[0] === c + 1 && chapterVerse[1] === v + 1) ? "secondary" : "primary")}>
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
                <Grid Grid item xs={gridsize[1]}>
                    <div className="div_scroll">
                        {comments.map(html => (
                            <>
                                {ReactHtmlParser(html.comment_en)}
                            </>
                        ))}
                    </div>
                </Grid>
            </Grid>

        )
    }
}