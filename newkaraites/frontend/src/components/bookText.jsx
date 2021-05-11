import React from "react";
import {useState, useEffect} from 'react';
import Container from '@material-ui/core/Container';
import axios from 'axios';
import {bookChapterUrl} from "../constants";


export default function BookText() {
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false);
    const [bookData, setBookData] = useState([]);


    useEffect(() => {
        axios.get(bookChapterUrl + 'Genesis/1/')
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
        return (<Container>

            <h3 lang="en" dir="LTR">{book['book_title_en']}</h3>
            <h3 lang="he" dir="RTL">{book['book_title_he']}</h3>
            {chapters.map((chapter, c) => (
                <div key={`i-${c}`}>
                    <h1 key={`ch-${c}`}>{chapter.chapter}</h1>
                    {chapter.text.map((verse, v) => (
                        <div key={`inner-${c}-${v}`}>
                            <p lang="en" key={`en-${c}-${v}`} dir="LTR">
                                {verse[0]}
                            </p>
                            <p lang="he" key={`-${c}-${v}`} dir="RTL">
                                {verse[1]}
                            </p>
                        </div>
                    ))}
                </div>
            ))}
        </Container>)
    }
}