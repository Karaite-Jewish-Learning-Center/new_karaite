const apiUrl = "http://localhost:8000/"
const bookListUrl = apiUrl + "api/books-list/"
const bookTextUrl = apiUrl+'api/get-book/'
const bookChapterUrl = apiUrl+'api/get-book-chapter/'
const getComments = apiUrl + "api/get-comments/"
const organization = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}

export {
    bookListUrl,
    bookTextUrl,
    bookChapterUrl,
    getComments,
    organization
}
