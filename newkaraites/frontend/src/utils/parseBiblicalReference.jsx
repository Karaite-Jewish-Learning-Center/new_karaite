import {hebrewBookNameToEnglish} from "./utils"
import gematriya from 'gematriya'
import {slug, capitalize, matchHebrewBookName} from "./utils"

export const parseHebrewRef = (biblicalRef) => {

    let chapterVerseBook = matchHebrewBookName(biblicalRef)
    if (chapterVerseBook.length < 2) {
        return {
            refBook: null,
            refChapter: null,
            refVerse: null,
            refHighlight: null
        }
    }

    let refBook = chapterVerseBook[1]
    let splitOn =( chapterVerseBook.indexOf(':') >= 0 ? ' ': ':')
    let [refChapter, refVerse] = chapterVerseBook[0].split(splitOn)

    if (refVerse.indexOf('-') > 0) {
        refVerse = refVerse.split('-')
    } else {
        refVerse = refVerse.split(',')
    }

    return {
        refBook: slug(hebrewBookNameToEnglish(refBook)),
        refChapter: gematriya(refChapter),
        refVerse: gematriya(refVerse[0]),
        refHighlight: refVerse.map(hebrewNumber => gematriya(hebrewNumber))
    }

}


export const parseEnglishRef = (biblicalRef) => {
    biblicalRef = capitalize(biblicalRef)
    let re = /[0-9]+/g
    let chapterVerse = biblicalRef.match(re)

    re = /[a-z,A-Z,' ']+/g
    if (chapterVerse === null) {
        // missing chapter and verse
        return {
            refBook: slug(biblicalRef.match(re)[0].trim()),
            refChapter: null,
            refVerse: null,
            refHighlight: null
        }
    }

    if (chapterVerse !== null && chapterVerse.length === 1) {
        // missing verse assume 1
        return {
            refBook: slug(biblicalRef.match(re)[0].trim()),
            refChapter: parseInt(chapterVerse[0]),
            refVerse: 1,
            refHighlight: null
        }
    }
    // full reference
    return {
        refBook: slug(biblicalRef.match(re)[0].trim()),
        refChapter: parseInt(chapterVerse[0]),
        refVerse: parseInt(chapterVerse[1]),
        refHighlight: chapterVerse.slice(1).map(arabic => parseInt(arabic)),
    }
}


export const parseBiblicalReference = (e) => {

    let language = e.target.childNodes[0].parentElement.lang
    let biblicalRef = e.target.childNodes[0].data.replace('(', '').replace(')', '').replace('cf. ', '').replace(':(', '')
    biblicalRef = biblicalRef.replace(', ', ':', 1).replace(',', ':', 1).replace('.', '').trim()

    if (language.toLowerCase() === 'he') {
        return parseHebrewRef(biblicalRef)
    }

    return parseEnglishRef(biblicalRef)

}

