import React from "react"
import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {bookChapterUrl, chaptersByBibleBook, karaitesBookUrl} from '../constants/constants';

const PARAGRAPHS = 0
const BOOK_DETAILS = 1


const fetchData = async (paneNumber, store,message,  url, type) => {
    try {
        store.setLoading(true)
        const response = await fetch(url)

        if (response.ok) {
            const data = await response.json()
            if (type === 'bible') {
                store.setBookData(data.chapter, paneNumber)
            } else {
                store.setParagraphs(data[PARAGRAPHS], paneNumber)
                store.setBookDetails(data[BOOK_DETAILS], paneNumber)
            }
            store.setLoading(false)
        }
    } catch (e) {
        message.setMessage("Error: " + e.message)
    } finally {
        store.setLoading(false)
    }
}

const getBook = async (book, chapter, verse, highlight, type, store, message) => {
    type = type.toLowerCase()
    let url = ''
    if (!store.isPaneOpen(book, chapter, verse)) {
        if (type === "bible") {
            store.setPanes({
                book: book,
                chapter: parseInt(chapter) - 1,
                verse: verse,
                bookData: [],
                highlight: [],
                type: type,
                verseData: [],
                refsChapterVerse: [0,0],
                isRightPaneOpen: false,
                references: [],
                distance: 0,
                currentItem: calculateItemNumber(book, chapter, verse),
                rightPaneState: [],
                rightPaneStateHalakhah: 1,
                languages: ['en_he', 'he', 'en'],
            })
            console.log('Item', calculateItemNumber(book, chapter, verse))
            url = makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false)

        } else {
            store.setPanes({
                book: book,
                chapter: parseInt(chapter) - 1,
                verse: verse,
                paragraphs: [],
                book_details: [],
                TOC: [],
                highlight: [],
                type: type,
                currentItem: chapter,
                languages: ['he', 'en'],
            })
            url = `${karaitesBookUrl}${store.getBook(store.panes.length - 1)}/${999999}/${0}/`
        }
        await fetchData(store.panes.length - 1, store, message, url, type)
    }
}

export default getBook