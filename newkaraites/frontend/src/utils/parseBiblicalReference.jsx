import {hebrewBookNameToEnglish, hebrewToIndoArabic} from "./utils";
import gematriya from 'gematriya';


const parseBiblicalReference = (e) => {
    // parse biblical ref
    let book
    let chapter
    let verse
    let chapterVerse
    let highlight
    let language = e.target.childNodes[0].parentElement.lang
    let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(':(', '')
    biblicalRef = biblicalRef .replace(', ', ':').replace(',', ':').replace('.', '').trim()

    if (language.toLowerCase() === 'he') {
        debugger
        let spacePos = biblicalRef.lastIndexOf(' ') + 1
        let refChapterVerse = biblicalRef.substr(spacePos)
        let [refChapter, refVerse] = refChapterVerse.split(':')

        let refBook = biblicalRef.replace(refChapterVerse, '').trim()
        if(refVerse.indexOf('-')>0) {
            refVerse = refVerse.split('-')
        }else{
            refVerse = refVerse.split(',')
        }
        book = hebrewBookNameToEnglish(refBook)
        chapter = gematriya(refChapter)
        verse = gematriya(refVerse[0])
        highlight = refVerse.map(hebrewNumber => gematriya(hebrewNumber))
        debugger
    } else {
        debugger
        let re = /[0-9]+/g
        chapterVerse = biblicalRef.match(re)
        chapter = parseInt(chapterVerse[0])
        verse = parseInt(chapterVerse[1])
        re = /[a-z,A-Z,' ']+/g
        book = biblicalRef.match(re)[0].trim()
        highlight = chapterVerse.slice(1).map(arabic => parseInt(arabic))
    }

    if ((book !== undefined && chapter !== undefined && verse !== undefined)) {
        return {book: book, chapter: chapter, verse: verse, highlight: highlight}
    }
    console.log(book, chapter, verse, highlight)
    throw('Invalid reference:' + biblicalRef)

}

export default parseBiblicalReference