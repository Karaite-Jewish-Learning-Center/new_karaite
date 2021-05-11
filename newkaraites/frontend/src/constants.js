const apiUrl = "http://localhost:8000/"
const bookListUrl = apiUrl + "api/books-list/"
const bookTextUrl = apiUrl+'api/get-book/'
const bookJsonUrl = apiUrl+'api/get-book-json/'
const getComments = apiUrl + "api/get-comments/"
const organization = {1: 'Torah', 2: 'Prophets', 3: 'Writings'}

export {
    bookListUrl,
    bookTextUrl,
    bookJsonUrl,
    getComments,
    organization
}
