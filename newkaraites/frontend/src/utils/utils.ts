import {versesByBibleBook} from '../constants/constants'

interface booksTable {
    [index: string]: string
}


export const capitalize = (string: string): string =>
    // respect all others cases
    string === "" ? "" : string[0].toUpperCase() + string.slice(1)

export const removeExtension = (string: string): string => string.replace(/\.[^/.]+$/, "")

export const removeSlash = (string: string): string => string.replace(/\//g, '')

export const getFirstPart = (string: string): string => string.split('/')[1]

export const range = (l: number): Array<number> =>
    Array(l).fill(1).map((_, i) => i + 1)

// compare 2 arrays, arrays must not be nested
export const equals = (a: Array<any>, b: Array<any>): boolean =>
    a.length === b.length && a.every((v, i) => v === b[i]);

export const makeBookUrl = (url: string, book: string, chapter: string, first: string, full: boolean): string =>
    (full ? `${url}${book}/` : `${url}${book}/${chapter}/${first}/`)

export const makeRandomKey = (): string => `k-${Math.random() * 10000000000}`

export const slug = (str: string): string => str.replaceAll(' ', '-')

export const unslug = (str: string): string => str.replaceAll('-', ' ')

export const underLine = (str: string): string => str.replaceAll(' ', '_')

export const normalizeSluggedBookName = (book: string): string => {
    // english book names
    book = slug(book)
    const pos = book.indexOf('-') + 1
    if (pos >= 0) {
        return book.substr(0, pos).toUpperCase() + capitalize(book.substr(pos, 1)) + book.substr(pos + 1).toLowerCase()
    }
    return capitalize(book)
}

export const calculateItemNumber = (book: string, chapter: string, verse: string): number => {
    return versesByBibleBook[normalizeSluggedBookName(book)].slice(0, parseInt(chapter) - 1).reduce((x, y) => x + y, 0) + parseInt(verse) - 1
}

export const englishBookNames: booksTable = {
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

export const hebrewBookNames: booksTable = {
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

export const hebrewBooks = (): Array<string> => Object.keys(hebrewBookNames)

export const englishBooks = (): Array<string> => Object.keys(englishBookNames)

export const matchHebrewBookName = (bibleRef: string): Array<string> => {
    for (let name of hebrewBooks()) {
        if (bibleRef.startsWith(name)) {
            return [bibleRef.replace(name, ''), name]
        }
    }
    return []
}

export const englishBookNameToHebrew = (englishBookName: string): string =>
    englishBookNames[capitalize(englishBookName.trim().toLowerCase())]

export const hebrewBookNameToEnglish = (hebrewBookName: string): string =>
    hebrewBookNames[hebrewBookName]

export const isABibleBook = (book: string): boolean =>
    // expects an English book name
    capitalize(book.trim().split(' ')[0]) in englishBookNames

// return an english title even if bookName is in Hebrew
export const toEnglish = (bookName: string): string => {
    const title = hebrewBookNameToEnglish(bookName)
    if (title === undefined) {
        return bookName
    }
    return title
}

