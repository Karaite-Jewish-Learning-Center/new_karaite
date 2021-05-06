import React from "react";
import {useState, useEffect} from 'react';
import Container from '@material-ui/core/Container';
import ReactHtmlParser from 'react-html-parser';
import {getComments} from "../constants";

export default function Comments() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [comment, setComment] = useState([]);


    useEffect(() => {
        fetch(getComments + 'Deuteronomy/1/21/')
            .then(res => res.json())
            .then(
                (result) => {
                    setComment(result);
                    setIsLoaded(true);
                },
                (error) => {
                    setIsLoaded(false);
                    setError(error);
                }
            )
    }, [])
    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        const html = comment['comment']['comment_en']
        debugger
        return (<Container>
            <h1>Comments</h1>
            <h2>{comment['comment']['book_name']}</h2>
            {ReactHtmlParser(html)}
        </Container>)
    }
}