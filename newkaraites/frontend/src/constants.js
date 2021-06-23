const apiUrl = 'http://localhost:8000/'
const bookListUrl = apiUrl + 'api/books-list/'
const bookTextUrl = apiUrl+'api/get-book/'
const bookChapterUrl = apiUrl+'api/get-book-chapter/'
const bookFromRef = apiUrl+'api/get-book-from-ref/'
const getCommentsUrl = apiUrl + 'api/get-comments/'
const organization = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}
const LANGUAGE = {0: 'en', 1: 'he'}
const LANGUAGE_TAG  = {'en':0,'he':1}
const ENGLISH = 0
const HEBREW = 1

export {
    bookListUrl,
    bookTextUrl,
    bookChapterUrl,
    bookFromRef,
    getCommentsUrl,
    organization,
    LANGUAGE,
    LANGUAGE_TAG,
    ENGLISH,
    HEBREW
}
