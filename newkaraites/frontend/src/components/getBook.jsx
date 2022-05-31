import {calculateItemNumber, makeBookUrl} from '../utils/utils';
import {bookChapterUrl, chaptersByBibleBook, karaitesBookUrl} from '../constants/constants';

const PARAGRAPHS = 0
const BOOK_DETAILS = 1


const fetchData = async (paneNumber, store, url, type) => {
    try {
        store.setLoading(true)
        const response = await fetch(url)

        if (response.ok) {
            const data = await response.json()
            if (type === 'bible') {
                store.setBookData(data.chapter, paneNumber)
            } else {
                store.setParagraphs(data[PARAGRAPHS][0], paneNumber)
                store.setBookDetails(data[BOOK_DETAILS], paneNumber)
            }
            store.setLoading(false)
        }
    } catch (e) {
        store.setMessage("Error: " + e.message)
    } finally {
        store.setLoading(false)
    }
}

const getBook = async (book, chapter, verse, highlight, type, store) => {
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
        await fetchData(store.panes.length - 1, store, url, type)
    }
}

export default getBook