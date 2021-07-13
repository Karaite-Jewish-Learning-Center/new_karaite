import {hebrewBookNameToEnglish, hebrewToIndoArabic} from "./utils";


const parseBiblicalReference = (e) => {
    // parse biblical ref
    let book
    let chapter
    let verse
    let chapterVerse
    let language = e.target.childNodes[0].parentElement.lang
    let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(', ', ':').replace(',', ':').replace('.', '').trim()
    if (language.toLowerCase() === 'he') {
        debugger
        let spacePos = biblicalRef.lastIndexOf(' ') + 1
        let refChapterVerse = biblicalRef.substr(spacePos)
        let [refChapter, refVerse] = refChapterVerse.split(':')
        let refBook = biblicalRef.replace(refChapterVerse, '').trim()
        refVerse = refVerse.split('-')
        book = hebrewBookNameToEnglish(refBook)
        chapter = hebrewToIndoArabic(refChapter)
        verse = hebrewToIndoArabic(refVerse[0])
        chapterVerse = refVerse.map(hebrewNumber => hebrewToIndoArabic(hebrewNumber))
    } else {
        debugger
        let re = /[0-9]+/g
        chapterVerse = biblicalRef.match(re)
        chapter = parseInt(chapterVerse[0])
        verse = parseInt(chapterVerse[1])
        re = /[a-z,A-Z]+/g
        book = biblicalRef.match(re)[0]
        chapterVerse = chapterVerse.slice(1).map(arabic => parseInt(arabic))
    }

    if ((book !== undefined && chapter !== undefined && verse !== undefined)) {
        return {book: book, chapter: chapter, verse: verse, chapterVerse: chapterVerse}
    }
    console.log(book, chapter, verse, chapterVerse)
    throw('Invalid reference:' + biblicalRef)

}

export default parseBiblicalReference