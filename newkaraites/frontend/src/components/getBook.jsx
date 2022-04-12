import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {bookChapterUrl, chaptersByBibleBook, karaitesBookUrl} from '../constants/constants';

const PARAGRAPHS = 0
const BOOK_DETAILS = 1


async function fetchDataBible(paneNumber, store) {
    if (store.getBookData(paneNumber).length === 0) {
        const book = store.getBook(paneNumber)
        const response = await fetch(makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false))
        if (response.ok) {
            const data = await response.json()
            store.setBookData(data.chapter, paneNumber)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }
}

async function fetchDataKaraites(paneNumber, store) {
    if (store.getParagraphs(paneNumber).length === 0) {
        const response = await fetch(`${karaitesBookUrl}${store.getBook(paneNumber)}/${999999}/${0}/`)
        if (response.ok) {
            const data = await response.json()
            debugger
            const details = data[BOOK_DETAILS]
            store.setParagraphs(data[PARAGRAPHS][0], paneNumber)
            store.setBookDetails(details, paneNumber)

        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

}

const getBook = async (book, chapter, verse, highlight, type, store) => {
    type = type.toLowerCase()
    let isOpen = store.isPaneOpen(book, chapter, verse)
    if (!isOpen) {
        if (type === "bible") {
            store.setPanes({
                book: book,
                chapter: parseInt(chapter) - 1,
                verse: verse,
                bookData: [],
                highlight: [],
                type: type,
                verseData: [],
                commentTab: 0,
                comments: [],
                commentsChapter: 0,
                commentsVerse: 0,
                isRightPaneOpen: false,
                references: [],
                distance: 0,
                currentItem: calculateItemNumber(book, chapter, verse),
                rightPaneState: [],
                rightPaneStateHalakhah: 1,
                languages: ['en_he', 'he', 'en'],
            })

            await fetchDataBible(store.panes.length - 1, store)
        }else{
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
            await fetchDataKaraites(store.panes.length - 1, store)
        }
    }
}

export default getBook