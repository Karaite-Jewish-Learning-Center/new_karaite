import React, { useEffect, useState } from 'react'
import { makeBookUrl } from "../utils/utils";
import BibleBooksWithComments from "../components/bible"
import { bookChapterUrl } from '../constants/constants'
import { makeDataStructure, fillDataStructure } from '../utils/utils'



const LoadBook = ({ book, chapter, verse }) => {

    const [bookData, setBookData] = useState(null)
    const [bookUtils, setBookUtils] = useState(null)

    async function fetchData(item) {

        const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
        if (response.ok) {
            const data = await response.json()

            setBookData(fillDataStructure(data, chapter, verse, makeDataStructure(data)))
            setBookUtils(data)

        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (bookData === null) return null

    return (
        <BibleBooksWithComments book={book} chapter={chapter} verse={verse} dataPlaceHolder={bookData} bookUtils={bookUtils} />
    )
}


export default LoadBook