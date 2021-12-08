import React, {useContext, useState} from 'react'
import Loading from '../general/Loading'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {versesByBibleBook} from "../../constants/constants";


const RenderTextGrid = ({paneNumber}) => {
    const store = useContext(storeContext)
    const book = store.getBook(paneNumber)
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})

    const calculateCurrentChapter = () => {
        let book = store.getBook(paneNumber)
        let avg = gridVisibleRange.startIndex + 1
        let start = 0
        let end = 0
        for (let i = 0; i < versesByBibleBook[book].length; i++) {
            end += versesByBibleBook[book][i]
            if (avg >= start && avg <= end) {
                return i + 1
            }
            start = end
        }
    }

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

    return (
        <>
            <RenderHeader book={book} paneNumber={paneNumber} chapter={calculateCurrentChapter()}/>
            <Virtuoso
                data={store.getBookData(paneNumber)}
                initialTopMostItemIndex={parseInt(store.getCurrentItem(paneNumber))}
                rangeChanged={setGridVisibleRange}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return <Loading/>
                    }
                }}
            />
        </>
    )
}


export default observer(RenderTextGrid)

