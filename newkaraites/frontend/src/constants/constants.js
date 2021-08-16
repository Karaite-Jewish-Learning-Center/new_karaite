const apiUrl = 'http://localhost:8000/'
const bookListUrl = apiUrl + 'api/books-list/'
const bookTextUrl = apiUrl + 'api/get-book/'
const bookChapterUrl = apiUrl + 'api/get-book-chapter/'
const bookFromRef = apiUrl + 'api/get-book-from-ref/'
const getCommentsUrl = apiUrl + 'api/get-comments/'
const getFirstLevelUrl = apiUrl + 'api/get-first-level/'
const organization = { 1: 'Torah', 2: 'Prophets', 3: 'Writings' }
const karaitesBookUrl = apiUrl + 'api/get-karaites-book/'
const karaitesBookAsArrayUrl = apiUrl + 'api/get-karaites-book/'
const karaitesBookDetailsUrl = apiUrl + 'api/get-karaites-book-details/'
const LANGUAGE = { 0: 'en', 1: 'he' }
const LANGUAGE_TAG = { 'en': 0, 'he': 1 }
const ENGLISH = 0
const HEBREW = 1
const BIBLE_ENGLISH = 0
const BIBLE_HEBREW = 1
const BIBLE_EN_CM = 2
const BIBLE_HE_CM = 3
const BIBLE_VERSE = 4
const BIBLE_CHAPTER = 5
const BIBLE_RENDER_CHAPTER = 6
const BOOK_CHAPTERS = 0
const BOOK_DATA = 1

const chaptersByBibleBook = {
    'Genesis': 50,
    'Exodus': 40,
    'Leviticus': 27,
    'Numbers': 36,
    'Deuteronomy': 34,
    'Joshua': 24,
    'Judges': 21,
    'I Samuel': 31,
    'II Samuel': 24,
    'I kings': 22,
    'II kings': 25,
    'Isaiah': 66,
    'Jeremiah': 52,
    'Ezekiel': 48,
    'Hosea': 14,
    'Joel': 4,
    'Amos': 9,
    'Obadiah':1 ,
    'Jonah': 4,
    'Micah': 7,
    'Nahum':3 ,
    'Habakkuk':3 ,
    'Zephaniah':3 ,
    'Haggai':2 ,
    'Zechariah':14 ,
    'Malachi':3 ,
    'Psalms': 150,
    'Proverbs': 31,
    'Job':42,
    'Song of Songs':8 ,
    'Ruth': 4,
    'Lamentations':5 ,
    'Ecclesiastes':12 ,
    'Esther': 10,
    'Daniel':12,
    'Ezra': 10,
    'Nehemiah':13,
    'I Chronicles': 29,
    'II Chronicles':36,
}


export {
    bookListUrl,
    bookTextUrl,
    bookChapterUrl,
    bookFromRef,
    getCommentsUrl,
    getFirstLevelUrl,
    organization,
    karaitesBookUrl,
    karaitesBookDetailsUrl,
    LANGUAGE,
    LANGUAGE_TAG,
    ENGLISH,
    HEBREW,
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_EN_CM,
    BIBLE_HE_CM,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_RENDER_CHAPTER,
    BOOK_CHAPTERS,
    BOOK_DATA,
    chaptersByBibleBook,

}
