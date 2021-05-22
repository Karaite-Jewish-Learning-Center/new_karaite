import React from "react";
import {useState, useEffect} from 'react';
import axios from 'axios';
import ReactHtmlParser from 'react-html-parser';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {getCommentsUrl} from "../constants";


const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));


export default function Comments({ chapter, verse}) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [comments, setComments] = useState([]);
    const [open, setOpen] = React.useState(false);

    const classes = useStyles()

    const handleOpen = () => {
        debugger
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        axios.get(getCommentsUrl + `Deuteronomy/${chapter}/${verse}/`)
            .then((response) => {
                setComments(response.data.comments);
                setIsLoaded(true);
                handleOpen();
            })
            .catch(error => {
                setError(error)
                console.log(`Error on ${getCommentsUrl}: ${error}`)
            })
    }, [chapter, verse])

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        return (
            <div className={classes.paper}>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    {/*<h1>Comments</h1>*/}
                    {/*<h2 lang="en" dir="LTR">{comment['book_title_en']}</h2>*/}
                    {/*<h2 lang="he" dir="RTL">{comment['book_title_he']}</h2>*/}
                    {/*{comments.map(html => (*/}
                    {/*    <div>*/}
                    {/*        {ReactHtmlParser(html.comment_en)}*/}
                    {/*    </div>*/}
                    {/*))}*/}
                    <div className={classes.paper}>
                        <h2 id="simple-modal-title">Comment</h2>
                        {comments.map(html => (
                            <div>
                                {ReactHtmlParser(html.comment_en)}
                            </div>
                        ))}
                    </div>
                </Modal>
            </div>)
    }
}