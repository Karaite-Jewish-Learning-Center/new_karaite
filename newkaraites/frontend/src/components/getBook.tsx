import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {
    bookChapterUrl,
    chaptersByBibleBook,
    karaitesBookUrl,
    betterBookUrl
} from '../constants/constants';
import {BookType} from '../types/commonTypes';
import {toJS} from 'mobx';


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
                    break

                case 'karaites':

                    store.setParagraphs(data[PARAGRAPHS], paneNumber)
                    store.setBookDetails(data[BOOK_DETAILS], paneNumber)
                    break

                case 'better':

                    store.setSongsBetter(data['songs'], paneNumber)
                    store.setBookDetailsBetter(data['details'], paneNumber)
                    store.setBookBetter(data['book_data'], paneNumber)
                    break

                default:
                    console.log('Invalid type', type)
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

    if (isNaN(chapter)) {
        chapter = 1
    }

    if (!store.isPaneOpen(book, chapter, verse)) {

        switch (type.toLowerCase()) {
            case 'bible':

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
                break

            case 'karaites':

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
                break

            case 'better':
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
                    currentItem: 0,
                    range: [0, 0],
                    languages: ['he', 'en'],
                })

                await fetchData(store.panes.length - 1, store, message, `${betterBookUrl}${book}/`, type)
                break

            default:
                console.log('Error: unknown book type')

        }
    }
}

export default getBook