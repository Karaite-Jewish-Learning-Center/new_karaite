import React from "react";
import {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';
import Grid from '@material-ui/core/Grid'
import {Typography} from '@material-ui/core';
import ReactHtmlParser from 'react-html-parser';
import CommentTwoToneIcon from '@material-ui/icons/CommentTwoTone';
import axios from 'axios';
import {bookChapterUrl, getCommentsUrl} from "../constants";
import './css/scroll.css';


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
})

export default function BookText() {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState([]);
    const [gridsize, setGridSize] = useState([12, 0])
    const [comments, setComments] = useState([])
    const [chapterVerse, setChapterVerse] = useState([])

    const classes = useStyles();

    const rowOnclick = (e) => {
        let [chapter, verse] = e.currentTarget.dataset.cV.split(',')
        chapter = parseInt(chapter) + 1
        verse = parseInt(verse) + 1
        // toggle comments
        if (gridsize[0] === 8 && chapterVerse[0] === chapter && chapterVerse[1] === verse) {
            setGridSize([12, 0])
            return
        }

        axios.get(getCommentsUrl + `Deuteronomy/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments)
                setChapterVerse([chapter, verse])
                setGridSize([8, 4])
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
        const book = bookData.book
        const chapters = bookData.chapters
        return (
            <Grid container
                  className={classes.root}
                  alignItems="baseline"
            >
                <Grid item xs={gridsize[0]}>
                    <Table className="scroll_table">
                        <TableBody>
                            {chapters.map((chapter, c) => (

                                <TableRow key={`r-${c}`}>
                                    {/*<h1 key={`ch-${c}`}>Chapter {chapter.chapter}</h1>*/}

                                    {chapter.text.map((verse, v) => (
                                        <TableRow key={`inner-${c}-${v}`}
                                                  hover={true}

                                        >

                                            <TableCell className={classes.text}>

                                                <Typography
                                                    align="right"
                                                    lang="he"
                                                    key={`he-${c}-${v}`}
                                                    dir="RTL">
                                                    {verse[1]}
                                                </Typography>
                                                <Typography align="right"
                                                            className={''}
                                                >
                                                    copy
                                                </Typography>
                                            </TableCell>

                                            <TableCell className={classes.verseNumber}>
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
                                                {(verse[2] !== '0' ?
                                                    <Tooltip title={"Click to read this comment" + (verse[2] == "1" ? '' : 's')}>
                                                        <Badge badgeContent={verse[2]} color={((chapterVerse[0] === c + 1 && chapterVerse[1] === v + 1) ? "secondary" : "primary")}>
                                                            <CommentTwoToneIcon/>
                                                        </Badge>
                                                    </Tooltip>
                                                    : null)}
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </Grid>
                <Grid Grid item xs={gridsize[1]}>
                    {comments.map(html => (
                        <div className="div_scroll">
                            {ReactHtmlParser(html.comment_en)}
                        </div>
                    ))}
                </Grid>
            </Grid>

        )
    }
}