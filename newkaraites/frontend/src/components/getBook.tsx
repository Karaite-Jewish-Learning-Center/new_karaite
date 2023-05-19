import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {
    bookChapterUrl,
    chaptersByBibleBook,
    karaitesBookUrl,
    betterBookUrl
} from '../constants/constants';
import {BookType} from '../types/commonTypes';


const PARAGRAPHS = 0
const BOOK_DETAILS = 1

const fetchData = async (paneNumber: number, store: any, message: any, url: string, type: BookType) => {
    try {

        store.setLoading(true)
        const response = await fetch(url)

        if (response.ok) {

            const data = await response.json()
            const lowerType = type.toLowerCase()

            if (lowerType === 'bible') {
                store.setBookData(data.chapter, paneNumber)
                store.setBookDetails(data.book, paneNumber)
            }

            if (lowerType === 'karaites') {
                store.setParagraphs(data[PARAGRAPHS], paneNumber)
                store.setBookDetails(data[BOOK_DETAILS], paneNumber)
            }

            if (lowerType === 'better') {
                let d = (data['book_data'])
                debugger
                store.setSongsBetter(data['songs'], paneNumber)
                store.setBookDetailsBetter(data['details'], paneNumber)
                store.setBookBetter(data['book_data'], paneNumber)
            }

            store.setLoading(false)
        }
    } catch
        (e: any) {
        message.setMessage("Error: " + e.message)
    } finally {
        store.setLoading(false)
    }
}

const getBook = async (book: string, chapter: number, verse: number, highlight: number[], type: BookType, store: any, message: any) => {
    debugger
    if (isNaN(chapter)) {
        chapter = 1
    }
    let x = store.isPaneOpen(book, chapter, verse)
    debugger

    let url = ''
    if (!store.isPaneOpen(book, chapter, verse)) {
        const lowerType = type.toLowerCase()
        if (lowerType === "bible") {
            store.setPanes({
                book: book,
                chapter: chapter - 1,
                verse: verse,
                bookData: [],
                book_details: [],
                highlight: [],
                type: 'bible',
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
            url = makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false)
            await fetchData(store.panes.length - 1, store, message, url, type)
        }
        if (lowerType === 'karaites') {
            store.setPanes({
                book: book,
                chapter: chapter - 1,
                verse: verse,
                paragraphs: [],
                book_details: [],
                TOC: [],
                highlight: [],
                type: 'karaites',
                currentItem: chapter,
                languages: ['he', 'en'],
            })
            url = `${karaitesBookUrl}${book}/${999999}/${0}/`
            await fetchData(store.panes.length - 1, store, message, url, type)
        }
        if (lowerType === 'better') {
            store.setPanes({
                book: book,
                chapter: chapter - 1,
                verse: verse,
                book_details: [],
                paragraphs: [],
                songs: [],
                TOC: [],
                highlight: [],
                type: 'better',
                languages: ['he', 'en'],
            })

            debugger
            await fetchData(store.panes.length - 1, store, message, `${betterBookUrl}${book}/`, type)
        }
    }
}

export default getBook