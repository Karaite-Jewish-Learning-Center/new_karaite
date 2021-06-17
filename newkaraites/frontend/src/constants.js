const apiUrl = 'http://localhost:8000/'
const bookListUrl = apiUrl + 'api/books-list/'
const bookTextUrl = apiUrl+'api/get-book/'
const bookChapterUrl = apiUrl+'api/get-book-chapter/'
const bookFromRef = apiUrl+'api/get-book-from-ref/'
const getCommentsUrl = apiUrl + 'api/get-comments/'
const organization = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}

export {
    bookListUrl,
    bookTextUrl,
    bookChapterUrl,
    bookFromRef,
    getCommentsUrl,
    organization
}
