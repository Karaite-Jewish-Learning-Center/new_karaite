import {versesByBibleBook} from '../constants/constants'
import {capitalize} from "./utils";

export const validateBiblicalReference = (book, chapter, verse) => {
    try {
        const theBook = capitalize(book)
        const chapterNumber = parseInt(chapter) - 1
        const verseNumber = parseInt(verse)
        const numberOfChapters = versesByBibleBook[theBook].length;
        const numberOfVerses = versesByBibleBook[theBook][chapterNumber]

        if (chapter > numberOfChapters) {
            return `The ${theBook} book has ${numberOfChapters} chapters.`
        }
        if (verseNumber > numberOfVerses) {
            return `The ${theBook} book chapter ${chapter} has ${numberOfVerses} verses.`
        }
        return ''
    } catch (e){
        return 'Invalid Bible reference. Ex: Genesis 10:1'
    }
}