import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {
    bookChapterUrl,
    chaptersByBibleBook,
    karaitesBookUrl,
    BetterBookUrl
} from '../constants/constants';
import {BookType} from '../types/commonTypes';
import {devLog} from "./messages/devLog";

const PARAGRAPHS = 0
const BOOK_DETAILS = 1

const fetchData = async (paneNumber: number, store: any, message: any, url: string, type: BookType) => {
    try {
        store.setLoading(true)
        const response = await fetch(url)
        if (response.ok) {
            const data = await response.json()
            switch (type.toLowerCase()) {
                case 'bible':
                    store.setBookData(data.chapter, paneNumber)
                    store.setBookDetails(data.book, paneNumber)
                    break;
                case 'karaites':
                    store.setParagraphs(data[PARAGRAPHS], paneNumber)
                    // todo:check this code - is it working ?
                    store.setBookDetails(data[BOOK_DETAILS], paneNumber)
                    break;
                case 'better':
                    store.setSongsBetter(data['songs'], paneNumber)
                    store.setBookDetailsBetter(data['details'], paneNumber)
                    store.setBookBetter(data['book'], paneNumber)
                    break;
                default:
                    console.log('Error: unknown type: ' + type)
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
    let url = ''
    let bookType = type.toLowerCase()
    debugger
    if (!store.isPaneOpen(book, chapter, verse)) {
        switch (bookType) {
            case "bible":
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
                devLog('Item ' + calculateItemNumber(book, chapter, verse))
                url = makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], '0', false)
                break;

            case "karaites":
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
                url = `${karaitesBookUrl}${store.getBook(store.panes.length - 1)}/${999999}/${0}/`
                break;

            case "better":
                store.setPanes({
                    book: book,
                    chapter: chapter - 1,
                    verse: verse,
                    bookDetails: [],
                    bookText: [],
                    songs: [],
                    TOC: [],
                    highlight: [],
                    type: 'better',
                    currentItem: chapter,
                    languages: ['he', 'en'],
                })

                url = `${BetterBookUrl}${store.getBook(store.panes.length - 1)}/`
                break;

            default:
                console.log('Error: unknown type: ' + type)
        }

        await fetchData(store.panes.length - 1, store, message, url, type)
    }
}

export default getBook