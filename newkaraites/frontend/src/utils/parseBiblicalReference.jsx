import { hebrewBookNameToEnglish } from "./utils";
import gematriya from 'gematriya';




const parseHebrew = (biblicalRef) => {
    let spacePos = biblicalRef.lastIndexOf(' ') + 1
    let refChapterVerse = biblicalRef.substr(spacePos)
    let [refChapter, refVerse] = refChapterVerse.split(':')

    let refBook = biblicalRef.replace(refChapterVerse, '').trim()
    if (refVerse.indexOf('-') > 0) {
        refVerse = refVerse.split('-')
    } else {
        refVerse = refVerse.split(',')
    }

    return {
        refBook: hebrewBookNameToEnglish(refBook),
        refChapter: gematriya(refChapter),
        refVerse: gematriya(refVerse[0]),
        refHighlight: refVerse.map(hebrewNumber => gematriya(hebrewNumber))
    }

}


const parseEnglish = (biblicalRef) => {
    let re = /[0-9]+/g
    let chapterVerse = biblicalRef.match(re)
    re = /[a-z,A-Z,' ']+/g
    return {
        refBook: biblicalRef.match(re)[0].trim(),
        refChapter: parseInt(chapterVerse[0]),
        refVerse: parseInt(chapterVerse[1]),
        refHighlight: chapterVerse.slice(1).map(arabic => parseInt(arabic)),
    }
}


const parseBiblicalReference = (e) => {

    let language = e.target.childNodes[0].parentElement.lang
    let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(':(', '')
    biblicalRef = biblicalRef.replace(', ', ':', 1).replace(',', ':', 1).replace('.', '').trim()

    if (language.toLowerCase() === 'he') {
        return parseHebrew(biblicalRef)
    }

    return parseEnglish(biblicalRef)

}

export default parseBiblicalReference