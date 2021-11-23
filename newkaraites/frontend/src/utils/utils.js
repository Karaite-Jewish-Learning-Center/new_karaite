import axios from 'axios';
import {getCommentsUrl} from "../constants/constants"
import {versesByBibleBook} from '../constants/constants'

export const capitalize = (string) => string === "" ? "": string[0].toUpperCase() + string.slice(1).toLowerCase()

export const range = (l) => {
    return Array(l).fill(1).map((_, i) => i + 1)
}

export const equals = (a, b) => {
    // compare 2 arrays, arrays must not be nested
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

export const getComments = async (book, chapter, verse) => {
    const res = await axios.get(getCommentsUrl + `${book}/${chapter}/${verse}`)
    return res;
}

export const makeBookUrl = (url, book, chapter, first, full) => {
    return (full ? `${url}${book}/` : `${url}${book}/${chapter}/${first}/`)
}

export const makeRandomKey = () => {
    return `k-${Math.random() * 10000000000}`
}

export const slug = (str) => {
    return str.replaceAll(' ', '-')
}

export const unslug = (str) => {
    return str.replaceAll('-', ' ')
}

export const calculateItemNumber = (book, chapter, verse) => {
    if (versesByBibleBook !== undefined) {
        return versesByBibleBook[book].slice(0, parseInt(chapter) - 1).reduce((x, y) => x + y, 0) + parseInt(verse) - 1
    }
    return 0
}

export const englishBookNames = {
    'Genesis': 'בראשית',
    'Exodus': 'שמות',
    'Leviticus': 'ויקרא',
    'Numbers': 'במדבר',
    'Deuteronomy': 'דברים',
    'Amos': 'עמוס',
    'Ezekiel': 'יחזקאל',
    'Habakkuk': 'חבקוק',
    'Haggai': 'חגי',
    'Hosea': 'הושע',
    'I Kings': 'מלכים א',
    'I Samuel': 'שמואל א',
    'II Kings': 'מלכים ב',
    'II Samuel': 'שמואל ב',
    'Isaiah': 'ישעיה',
    'Jeremiah': 'ירמיה',
    'Joel': 'יואל',
    'Jonah': 'יונה',
    'Joshua': 'יהושע',
    'Judges': 'שופטים',
    'Malachi': 'מלאכי',
    'Micah': 'מיכה',
    'Nahum': 'נחום',
    'Obadiah': 'עובדיה',
    'Zechariah': 'זכריה',
    'Zephaniah': 'צפניה',
    'Daniel': 'דניאל',
    'Ecclesiastes': 'קהלת',
    'Esther': 'אסתר',
    'Ezra': 'עזרא',
    'I Chronicles': 'דברי הימים א',
    'II Chronicles': 'דברי הימים ב',
    'Job': 'איוב',
    'Lamentations': 'איכה',
    'Nehemiah': 'נחמיה',
    'Proverbs': 'משלי',
    'Psalms': 'תהילים',
    'Ruth': 'רות',
    'Song of Songs': 'שיר השירים'
}

export const hebrewBookNames = {
    'בראשית': 'Genesis',
    'שמות': 'Exodus',
    'ויקרא': 'Leviticus',
    'במדבר': 'Numbers',
    'דברים': 'Deuteronomy',
    'עמוס': 'Amos',
    'יחזקאל': 'Ezekiel',
    'חבקוק': 'Habakkuk',
    'חגי': 'Haggai',
    'הושע': 'Hosea',
    'מלכים א': 'I Kings',
    'שמואל א': 'I Samuel',
    'מלכים ב': 'II Kings',
    'שמואל ב': 'II Samuel',
    'ישעיה': 'Isaiah',
    'ישעיהו': 'Isaiah', // typo ?
    'ירמיה': 'Jeremiah',
    'ירמיהו': 'Jeremiah', // typo ?
    'יואל': 'Joel',
    'יונה': 'Jonah',
    'יהושע': 'Joshua',
    'שופטים': 'Judges',
    'מלאכי': 'Malachi',
    'מיכה': 'Micah',
    'נחום': 'Nahum',
    'עובדיה': 'Obadiah',
    'זכריה': 'Zechariah',
    'צפניה': 'Zephaniah',
    'דניאל': 'Daniel',
    'קהלת': 'Ecclesiastes',
    'אסתר': 'Esther',
    'עזרא': 'Ezra',
    'דברי הימים א': 'I Chronicles',
    'דברי הימים ב': 'II Chronicles',
    'איוב': 'Job',
    'איכה': 'Lamentations',
    'נחמיה': 'Nehemiah',
    'משלי': 'Proverbs',
    'תהלים': 'Psalms', // possible typo
    'תהילים': 'Psalms',
    'רות': 'Ruth',
    'שיר השירים': 'Song of Songs'
}

export const englishBookNameToHebrew = (englishBookName) => {
    return englishBookNames[englishBookName.trim()]
}


export const hebrewBookNameToEnglish = (hebrewBookName) => {
    return hebrewBookNames[hebrewBookName]
}

export const hebrewBooks = () => {
    return Object.keys(hebrewBookNames)
}

export const englishBook = () => {
    return Object.keys(englishBookNames)
}

export const isABibleBook = (book) => capitalize(book.trim().split(' ')[0]) in englishBookNames

export const toEnglish = (bookName) => {
    // return a english title even if bookName is Hebrew
    let title = hebrewBookNameToEnglish(bookName)
    if (title === undefined) {
        return bookName
    }
    return title
}
