import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {bookChapterUrl, chaptersByBibleBook, karaitesBookUrl} from '../constants/constants';
import {BookType} from '../types/commonTypes';
import {devLog} from "./messages/devLog";

const PARAGRAPHS = 0
const BOOK_DETAILS = 1


const fetchData = async (paneNumber: number, store: any, message: any, url: string, type:BookType) => {
    try {
        store.setLoading(true)
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            if (type === 'bible') {
                store.setBookData(data.chapter, paneNumber)
                store.setBookDetails(data.book, paneNumber)
            } else {
                store.setParagraphs(data[PARAGRAPHS], paneNumber)
                // todo:check this code - is it working ?
                store.setBookDetails(data[BOOK_DETAILS], paneNumber)
            }
            store.setLoading(false)
        }
    } catch
        (e:any) {
        message.setMessage("Error: " + e.message)
    } finally {
        store.setLoading(false)
    }
}

const getBook = async (book: string, chapter: number, verse: number, highlight: number[], type: BookType, store: any, message: any) => {
    debugger
    let url = ''
    if (!store.isPaneOpen(book, chapter, verse)) {
        if (type === "bible") {
            store.setPanes({
                book: book,
                chapter: chapter - 1,
                verse: verse,
                bookData: [],
                book_details: [],
                highlight: [],
                type: type,
                verseData: [],
                refsChapterVerse: [0, 0],
                isRightPaneOpen: false,
                references: [],
                distance: 0,
                currentItem: calculateItemNumber(book, chapter, verse),
                rightPaneState: [],
                rightPaneStateHalakhah: 1,
                languages: ['en_he', 'he', 'en'],
            })
            devLog('Item ' + calculateItemNumber(book, chapter, verse))
            url = makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false)

        } else {
            store.setPanes({
                book: book,
                chapter: chapter - 1,
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