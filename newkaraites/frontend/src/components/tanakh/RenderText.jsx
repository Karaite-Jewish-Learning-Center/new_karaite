import React, {useContext, useEffect, useRef, useState} from 'react'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {speechContext} from "../../stores/ttspeechContext";
import {versesByBibleBook} from "../../constants/constants";


const RenderTextGrid = ({paneNumber, onClosePane}) => {
    const store = useContext(storeContext)
    const speech = useContext(speechContext)
    const book = store.getBook(paneNumber)
    const [speaking, setSpeaking] = useState(false)
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const [index, setIndex] = useState(store.getCurrentItem(paneNumber))
    const virtuoso = useRef(null)

    const callFromEnded = () => {
        setTimeout(() => {
            //     @ts-ignore
            setIndex(index + 1)
            virtuoso.current.scrollToIndex({
                index: index + 1,
                align: 'top',
                behavior: 'smooth',
            })
            setSpeaking(() => true)
        }, 300)

    }
    const onSpeakOnOff = () => {
        if (speaking) {
            setSpeaking(false)
            speech.cancel()
        } else {
            setSpeaking(true)
        }
    }

    useEffect(() => {
        console.log('speaking', speaking)
        if (speaking) speech.play(store.getBookData(paneNumber)[index][0], callFromEnded)

        return ()=>{
            speech.cancel()
        }
    }, [index, speaking])

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
                speaking={speaking}
            />
        )
    }

    return (
        <>
            <RenderHeader book={book}
                          paneNumber={paneNumber}
                          chapter={calculateCurrentChapter()}
                          onClosePane={onClosePane}
                          speaking={speaking}
                          speak={onSpeakOnOff}
            />

            <Virtuoso
                data={store.getBookData(paneNumber)}
                ref={virtuoso}
                initialTopMostItemIndex={store.getCurrentItem(paneNumber)}
                rangeChanged={setGridVisibleRange}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return (
                            <div style={{padding: '1rem', textAlign: 'center'}}>
                                Book end.
                            </div>
                        )
                    }
                }}
            />
        </>
    )
}
export default observer(RenderTextGrid)
