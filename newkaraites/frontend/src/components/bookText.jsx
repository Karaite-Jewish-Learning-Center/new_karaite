import React from "react";
import {useState, useEffect} from 'react';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import {bookTextUrl} from "../constants";


export default function BookText() {
    const [error, setError] =useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookText, setBookText] = useState([]);


    useEffect(() => {
        axios.get(bookTextUrl + 'Genesis/')
            .then((response) => {
                debugger
                setBookText(response.data.book_text);
                setIsLoaded(true);
            })
            .catch(error => {
                console.log(`Error on ${bookTextUrl}: ${error.response.data.message}`)
            })
    }, [])
    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        return (<Container>
            <h1>Book</h1>
            {/*<h2 lang="en" dir="LTR">{comment['book_title_en']}</h2>*/}
            {/*<h2 lang="he" dir="RTL">{comment['book_title_he']}</h2>*/}
            {bookText.map(html => (
                <div>
                    <p lang="en" dir="LTR">
                        {html.text_en}
                    </p>
                    <p lang="he" dir="RTL">
                        {html.text_he}
                    </p>
                </div>
            ))}
        </Container>)
    }
}