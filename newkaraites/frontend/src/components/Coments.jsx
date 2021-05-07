import React from "react";
import {useState, useEffect} from 'react';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import ReactHtmlParser from 'react-html-parser';
import {getComments} from "../constants";

export default function Comments() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [comments, setComments] = useState([]);


    useEffect(() => {
        axios.get(getComments + 'Deuteronomy/1/')
            .then((response) => {
                debugger
                setComments(response.data.comments);
                setIsLoaded(true);
            })
            .catch(error => {
                console.log(`Error on ${getComments}: ${error.response.data.message}`)
            })
    }, [])
    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        return (<Container>
            <h1>Comments</h1>
            {/*<h2 lang="en" dir="LTR">{comment['book_title_en']}</h2>*/}
            {/*<h2 lang="he" dir="RTL">{comment['book_title_he']}</h2>*/}
            {comments.map(html => (
                <div>
                    {ReactHtmlParser(html.comment_en)}
                </div>
            ))}
        </Container>)
    }
}