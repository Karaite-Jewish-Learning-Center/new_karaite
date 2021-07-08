const apiUrl = 'http://localhost:8000/'
const bookListUrl = apiUrl + 'api/books-list/'
const bookTextUrl = apiUrl + 'api/get-book/'
const bookChapterUrl = apiUrl + 'api/get-book-chapter/'
const bookChapterUrlOld = apiUrl + 'api/get-book-chapter-old/'
const bookFromRef = apiUrl + 'api/get-book-from-ref/'
const getCommentsUrl = apiUrl + 'api/get-comments/'
const organization = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}
const karaitesBookUrl = apiUrl + 'api/get-karaites-book/'
const LANGUAGE = {0: 'en', 1: 'he'}
const LANGUAGE_TAG = {'en': 0, 'he': 1}
const ENGLISH = 0
const HEBREW = 1
const BIBLE_ENGLISH = 0
const BIBLE_HEBREW = 1
const BIBLE_EN_CM = 2
const BIBLE_HE_CM = 3
const BIBLE_VERSE = 4
const BIBLE_CHAPTER = 5
const BOOK_CHAPTERS = 0
const BOOK_DATA = 1

export {
    bookListUrl,
    bookTextUrl,
    bookChapterUrl,
    bookChapterUrlOld,
    bookFromRef,
    getCommentsUrl,
    organization,
    karaitesBookUrl,
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
    BOOK_CHAPTERS,
    BOOK_DATA,

}
