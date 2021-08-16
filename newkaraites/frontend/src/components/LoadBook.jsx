import React, { useEffect, useState } from 'react'
import { makeBookUrl } from "../utils/utils";
import Bible from "./Bible"
import { bookChapterUrl } from '../constants/constants'


const LoadBook = ({ book, chapter, verse }) => {
    const [bookUtils, setBookUtils] = useState(null)
    const first = 0  // loading book for the first time

    async function fetchData(item) {
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, first, false))
        if (response.ok) {
            const data = await response.json()
            setBookUtils(data)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    if (bookUtils === null) return null
    
    return (
        <Bible book={book} chapter={chapter} verse={verse} bookUtils={bookUtils} />
    )
}


export default LoadBook