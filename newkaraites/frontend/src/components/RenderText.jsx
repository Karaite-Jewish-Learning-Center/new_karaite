import React, { useState, useEffect } from 'react'
import Loading from './Loading'

import { Virtuoso } from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite'


const RenderTextGrid = ({ paneNumber }) => {
    const book = store.getBook(paneNumber)

    const [chapterViewPort, setChapterViewPort] = useState(null)
    const [loadingText, setLoadingText] = useState([])
    const [verses, setVerses] = useState([''])
    const [gridVisibleRange, setGridVisibleRange] = useState({ startIndex: 0, endIndex: 0 })


    const itemContent = (item, data) => {

        return (
            <ChapterHeaderVerse
                data={data}
                item={item}
                gridVisibleRange={gridVisibleRange}
                paneNumber={paneNumber}
            />
        )
    }

    // async function fetchData() {
    //     const response = await fetch(makeBookUrl(bookChapterUrl, book, chaptersByBibleBook[book], 0, false))
    //     if (response.ok) {
    //         const data = await response.json()
    //         //setVerses(data.book.verses)
    //         store.setBookData(data.chapter, paneNumber)
    //     } else {
    //         alert("HTTP-Error: " + response.status)
    //     }
    // }


    const calculateCurrentChapter = (visibleRange) => {
        let avg = visibleRange.startIndex + 1
        let start = 0
        let end = 0
        for (let i = 0; i < verses.length; i++) {
            end += verses[i]
            if (avg >= start && avg <= end) {
                setChapterViewPort(i + 1)
                return
            }
            start = end
        }
    }

    const visibleRange = (range) => {
        calculateCurrentChapter(range)
        setGridVisibleRange(range)
    }


    // useEffect(() => {
    //     fetchData()
    // }, [])

    return (
        <>
            <RenderHeader book={book} chapterViewPort={chapterViewPort} paneNumber={paneNumber} />
            <Virtuoso
                data={store.getBookData(paneNumber)}
                initialTopMostItemIndex={parseInt(store.getCurrentItem(paneNumber))}
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


export default observer(RenderTextGrid)

