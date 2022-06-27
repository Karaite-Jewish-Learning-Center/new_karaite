interface versesTable {
    readonly [index: string]: Array<number>
}

interface chapterTable {
    readonly  [index: string]: number
}

interface numberString {
    readonly [index: number]: string
}

interface stringNumber {
    readonly [index: string]: number
}

let api: string

if (process.env.NODE_ENV === 'development') {
    api = 'http://localhost:8000/'
} else {
    api = 'https://kjlc.karaites.org/'
    //api = 'http://dev.karaites.org/'
}

export const apiUrl = api
export const apiUrlNoSlash = api.substr(0, api.length-1)
// first level  see constants.py
export const TANAKH: string = '1'
export const HALAKHAH: string = '3'
export const LITURGY: string = '4'
export const POLEMIC: string = '5'
export const COMMENTS: string = '8'
export const POETRY: string = '9'
export const EXHORTATORY:string ='11'


export const TRANSFORM_TYPE: string = 'Bible'

export const organization: numberString = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}

//export const bookListUrl: string = apiUrl + 'api/books-list/'
//export const bookTextUrl: string = apiUrl + 'api/get-book/'
export const bookChapterUrl: string = apiUrl + 'api/get-book-chapter/'
//export const bookFromRef: string = apiUrl + 'api/get-book-from-ref/'
export const getCommentsUrl: string = apiUrl + 'api/get-comments/'
export const getFirstLevelUrl: string = apiUrl + 'api/get-first-level/'
export const karaitesBookUrl: string = apiUrl + 'api/get-karaites-book-chapter/'
export const karaitesBookDetailsUrl: string = apiUrl + 'api/get-karaites-book-details/'
export const karaitesBookByLevel: string = apiUrl + 'api/get-karaites-books-by-level/'
export const karaitesBookByLevelAndClassification: string = apiUrl + 'api/get-karaites-books-by-level-and-classification/'
export const karaitesBookToc: string = apiUrl + 'api/get-karaites-book-toc/'
export const referencesUrl: string = apiUrl + 'api/get-references/'
export const autocompleteUrl: string = apiUrl + 'api/autocomplete/'
export const searchResultsUrl: string = apiUrl + 'api/search/'
export const getLevels: string = apiUrl + 'api/get-first-level/'
export const getBiblereferencesUrl: string = apiUrl + 'api/get-bible-references/'

// there will be more languages as project evolves
export const LANGUAGE: numberString = {0: 'en', 1: 'he', 2: 'en_he'}
export const LANGUAGE_KEY: stringNumber = {'en': 0, 'he': 1, 'en_he': 2}
export const LANGUAGE_SYMBOL: numberString = {0: 'A', 1: '\u2135', 2: 'A\u2135'}

export const ENGLISH: number = 0
export const HEBREW: number = 1

export const BIBLE_ENGLISH: number = 0
export const BIBLE_HEBREW: number = 1
export const BIBLE_EN_CM: number = 2
export const BIBLE_HE_CM: number = 3
export const BIBLE_VERSE: number = 4
export const BIBLE_CHAPTER: number = 5
export const BIBLE_RENDER_CHAPTER: number = 6
export const BIBLE_REFS: number = 7

export const BOOK_CHAPTERS: number = 0
export const BOOK_DATA: number = 1

// this value is define in the views.py if changed there must be changed here too.
export const ITEMS_PER_PAGE: number = 15

export const LOADING_TEXT: string = 'Loading...'

export const chaptersByBibleBook: chapterTable = {
    'Genesis': 50,
    'Exodus': 40,
    'Leviticus': 27,
    'Numbers': 36,
    'Deuteronomy': 34,
    'Joshua': 24,
    'Judges': 21,
    'I Samuel': 31,
    'I-Samuel': 31,
    'II Samuel': 24,
    'II-Samuel': 24,
    'I Kings': 22,
    'I-Kings': 22,
    'II Kings': 25,
    'II-Kings': 25,
    'Isaiah': 66,
    'Jeremiah': 52,
    'Ezekiel': 48,
    'Hosea': 14,
    'Joel': 4,
    'Amos': 9,
    'Obadiah': 1,
    'Jonah': 4,
    'Micah': 7,
    'Nahum': 3,
    'Habakkuk': 3,
    'Zephaniah': 3,
    'Haggai': 2,
    'Zechariah': 14,
    'Malachi': 3,
    'Psalms': 150,
    'Proverbs': 31,
    'Job': 42,
    'Song of Songs': 8,
    'Song-of-Songs': 8,
    'Ruth': 4,
    'Lamentations': 5,
    'Ecclesiastes': 12,
    'Esther': 10,
    'Daniel': 12,
    'Ezra': 10,
    'Nehemiah': 13,
    'I Chronicles': 29,
    'I-Chronicles': 29,
    'II Chronicles': 36,
    'II-Chronicles': 36,
}

// verses by chapter
export const versesByBibleBook: versesTable = {
    'Genesis': [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
    'Exodus': [22, 25, 22, 31, 23, 30, 29, 28, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 23, 37, 30, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38],
    'Leviticus': [17, 16, 17, 35, 26, 23, 38, 36, 24, 20, 47, 8, 59, 57, 33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34],
    'Numbers': [54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45, 41, 35, 28, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 39, 17, 54, 42, 56, 29, 34, 13],
    'Deuteronomy': [46, 37, 29, 49, 30, 25, 26, 20, 29, 22, 32, 31, 19, 29, 23, 22, 20, 22, 21, 20, 23, 29, 26, 22, 19, 19, 26, 69, 28, 20, 30, 52, 29, 12],
    'Joshua': [18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15, 63, 10, 18, 28, 51, 9, 45, 34, 16, 33],
    'Judges': [36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20, 20, 31, 13, 31, 30, 48, 25],
    'I Samuel': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
    'I-Samuel': [28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52, 35, 23, 58, 30, 24, 42, 16, 23, 28, 23, 44, 25, 12, 25, 11, 31, 13],
    'II Samuel': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
    'II-Samuel': [27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33, 37, 23, 29, 32, 44, 26, 22, 51, 39, 25],
    'I Kings': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'I-Kings': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'II Kings': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    'II-Kings': [18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 20, 22, 25, 29, 38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30],
    'Isaiah': [31, 22, 26, 6, 30, 13, 25, 23, 20, 34, 16, 6, 22, 32, 9, 14, 14, 7, 25, 6, 17, 25, 18, 23, 12, 21, 13, 29, 24, 33, 9, 20, 24, 17, 10, 22, 38, 22, 8, 31, 29, 25, 28, 28, 25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21, 22, 11, 12, 19, 11, 25, 24],
    'Jeremiah': [19, 37, 25, 31, 31, 30, 34, 23, 25, 25, 23, 17, 27, 22, 21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32, 24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30, 5, 28, 7, 47, 39, 46, 64, 34],
    'Ezekiel': [28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23, 8, 63, 24, 32, 14, 44, 37, 31, 49, 27, 17, 21, 36, 26, 21, 26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31, 25, 24, 23, 35],
    'Hosea': [53, 46, 28, 20, 32, 38, 51, 66, 28, 29, 43, 33, 34, 31, 34, 34, 24, 46, 21, 43, 29, 54],
    'Joel': [20, 27, 5, 21],
    'Amos': [15, 16, 15, 13, 27, 14, 17, 14, 15],
    'Obadiah': [21],
    'Jonah': [16, 11, 10, 11],
    'Micah': [16, 13, 12, 14, 14, 16, 20],
    'Nahum': [14, 14, 19],
    'Habakkuk': [17, 20, 19],
    'Zephaniah': [18, 15, 20],
    'Haggai': [15, 23],
    'Zechariah': [17, 17, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14, 9, 21],
    'Malachi': [14, 17, 24],
    'Psalms': [6, 12, 9, 9, 13, 11, 18, 10, 21, 18, 7, 9, 6, 7, 5, 11, 15, 51, 15, 10, 14, 32, 6, 10, 22, 12, 14, 9, 11, 13, 25, 11, 22, 23, 28, 13, 40, 23, 14, 18, 14, 12, 5, 27, 18, 12, 10, 15, 21, 23, 21, 11, 7, 9, 24, 14, 12, 12, 18, 14, 9, 13, 12, 11, 14, 20, 8, 36, 37, 6, 24, 20, 28, 23, 11, 13, 21, 72, 13, 20, 17, 8, 19, 13, 14, 17, 7, 19, 53, 17, 16, 16, 5, 23, 11, 13, 12, 9, 9, 5, 8, 29, 22, 35, 45, 48, 43, 14, 31, 7, 10, 10, 9, 8, 18, 19, 2, 29, 176, 7, 8, 9, 4, 8, 5, 6, 5, 6, 8, 8, 3, 18, 3, 3, 21, 26, 9, 8, 24, 14, 10, 8, 12, 15, 21, 10, 20, 14, 9, 6],
    'Proverbs': [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31],
    'Job': [22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22, 35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6, 14, 23, 28, 25, 31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 32, 26, 17],
    'Song of Songs': [17, 17, 11, 16, 16, 12, 14, 14],
    'Song-of-Songs': [17, 17, 11, 16, 16, 12, 14, 14],
    'Ruth': [22, 23, 18, 22],
    'Lamentations': [22, 22, 66, 22, 22],
    'Ecclesiastes': [18, 26, 22, 17, 19, 12, 29, 17, 18, 20, 10, 14],
    'Esther': [22, 23, 15, 17, 14, 14, 10, 17, 32, 3],
    'Daniel': [21, 49, 33, 34, 30, 29, 28, 27, 27, 21, 45, 13],
    'Ezra': [11, 70, 13, 24, 17, 22, 28, 36, 15, 44],
    'Nehemiah': [11, 20, 38, 17, 19, 19, 72, 18, 37, 40, 36, 47, 31],
    'I Chronicles': [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    'I-Chronicles': [54, 55, 24, 43, 41, 66, 40, 40, 44, 14, 47, 41, 14, 17, 29, 43, 27, 17, 19, 8, 30, 19, 32, 31, 31, 32, 34, 21, 30],
    'II Chronicles': [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
    'II-Chronicles': [18, 17, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 23, 14, 19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9, 27, 36, 27, 21, 33, 25, 33, 27, 23],
}

// this is experimental and probably removed in the near future.
export const q640: string = '(min-width:640px)'