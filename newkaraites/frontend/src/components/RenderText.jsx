import React, { useState, useEffect, useRef } from 'react'
import Loading from './Loading'
import { chaptersByBibleBook } from '../constants/constants'
import { bookChapterUrl } from '../constants/constants'
import { makeBookUrl } from "../utils/utils"
import { Virtuoso } from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite';



const RenderTextGrid = ({ paneNumber }) => {
    const virtuoso = useRef(null);
    const book = store.getBook(paneNumber)
    const verse = store.getVerse(paneNumber)

    const [chapterViewPort, setChapterViewPort] = useState()
    const [loadingText, setLoadingText] = useState([])
    const [verses, setVerses] = useState([''])
    const [currentChapter, setCurrentChapter] = useState(store.getChapter(paneNumber))
    const [bookData, setBookData] = useState([])
    const [first, setFirst] = useState(0) // it's the first time that we read data for this book

    const itemContent = (item, data) => {
        if (store.getIsRightPaneOpen(paneNumber)) store.setVerseData(data, paneNumber)

        return (
            <ChapterHeaderVerse
                data={data}
                item={item}
                paneNumber={paneNumber}
            />
        )
    }

    async function fetchData() {
        if (currentChapter <= chaptersByBibleBook[book]) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, currentChapter, first, false))
            if (response.ok) {
                const data = await response.json()
                setVerses(data.book.verses)
                setBookData([...bookData, ...data.chapter])
                setCurrentChapter(() => currentChapter + 1)
                if (first === 0) {
                    setFirst(1)
                }
            } else {
                alert("HTTP-Error: " + response.status)
            }
        } else {
            setLoadingText('End of book.')
        }
    }

    const calcIndex = () => {
        // calc index of virtuoso element based on chapter and verse
        return verses.slice(0, currentChapter - 2).reduce((x, y) => x + y, 0) + verse - 1
    }
    const calculateCurrentChapter = (visibleRange) => {
        // calc highligh position
        let hl = visibleRange.startIndex + Math.round((visibleRange.endIndex - visibleRange.startIndex) / 2)
        // calc Current Chapter
        let avg = visibleRange.startIndex + 1
        let start = 0
        let end = 0
        for (let i = 0; i < verses.length; i++) {
            end += verses[i]
            if (avg >= start && avg <= end) {
                if (store.getIsRightPaneOpen(paneNumber)) {
                    setChapterViewPort(i + 1)
                    //  setHighLight(hl)
                } else {
                    setChapterViewPort(i + 1)
                    //  setHighLight(-1)
                }
                return
            }
            start = end
        }
    }

    const visibleRange = (range) => {
        calculateCurrentChapter(range)
    }

    const jump = () => {
        virtuoso.current.scrollToIndex({
            index: calcIndex(),
            align: 'center',
        });
    }

    if (virtuoso.current !== null && first === 0) jump()



    useEffect(() => {
        fetchData()
    }, [])


    console.log("rendering RenderText")
    return (
        <>
            <RenderHeader book={book} chapterViewPort={chapterViewPort} paneNumber={paneNumber} />
            <Virtuoso
                data={bookData}
                ref={virtuoso}
                endReached={fetchData}
                rangeChanged={visibleRange}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return <Loading text={loadingText} />
                    }
                }}
            />
        </>
    )
}

const anyChange = (prevProps, nextProps) => {
    console.log({ prevProps })
    console.log("Book", prevProps.book === nextProps.book)
    console.log("Chapter", prevProps.chapter === nextProps.chapter)
    console.log("Verse", prevProps.verse === nextProps.verse)
    console.log("Verses", prevProps.verses === nextProps.verses)
    // console.log("bookData", equals(prevProps.bookData, nextProps.bookData))
    console.log("Verses", prevProps.paneNumber === nextProps.paneNumber)
    console.log("Verses", prevProps.paneNumber === nextProps.paneNumber)
    let result = prevProps.book === nextProps.book &&
        prevProps.chapter === nextProps.chapter &&
        prevProps.verse === nextProps.verse &&
        prevProps.verses === nextProps.verses &&
        // equals(prevProps.bookData, nextProps.bookData) &&
        prevProps.paneNumber === nextProps.paneNumber &&
        prevProps.isRightPaneOpen === nextProps.isRightPaneOpen
    console.log("result", result)

    return result
}

const RenderText = React.memo(RenderTextGrid, anyChange)

export default RenderTextGrid

