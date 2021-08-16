import React, { useEffect, useState } from 'react'
import { makeBookUrl } from "../utils/utils";
import BibleBooksWithComments from "../components/bible"
import { bookChapterUrl } from '../constants/constants'



const LoadBook = ({ book, chapter, verse }) => {
    const [bookUtils, setBookUtils] = useState(null)

    async function fetchData(item) {
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
        if (response.ok) {
            const data = await response.json()
            debugger
            setBookUtils(data)

        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

   

    return (
        <BibleBooksWithComments book={book} chapter={chapter} verse={verse} bookUtils={bookUtils} />
    )
}


export default LoadBook