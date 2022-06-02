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
    const [flip, setFlip] = useState([false, false])
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const [index, setIndex] = useState(store.getCurrentItem(paneNumber))
    const virtuoso = useRef(null)

    const callFromEnded = () => {
        setIndex(index + 1)
        store.setCurrentItem(store.getCurrentItem(paneNumber) + 1, paneNumber)
        setTimeout(() => {
            //     @ts-ignore
            // store.setCurrentItem(index+1, paneNumber)
            // setIndex(index + 1)
            // store.setCurrentItem(index, paneNumber)
            virtuoso.current.scrollToIndex({
                index: index + 1,
                align: 'top',
                behavior: 'smooth',
            })
            setSpeaking(() => true)
        }, 300)

    }
    const onSpeakOnOffEn = () => {
        if (speaking) {
            setSpeaking(false)
            setFlip([false, false])
            speech.cancel()
        } else {
            setFlip([false, true])
            speech.setLanguage('en')
            setSpeaking(true)
        }
    }

    const onSpeakOnOffHe = () => {
        if (speaking) {
            setSpeaking(false)
            setFlip([false, false])
            speech.cancel()
        } else {
            setFlip([true, false])
            speech.setLanguage('he')
            setSpeaking(true)
        }
    }

    useEffect(() => {

        if (speaking) {
            speech.play(store.getBookData(paneNumber)[index], callFromEnded)
        }

        return () => {
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
                          onSpeakOnOffHe={onSpeakOnOffHe}
                          onSpeakOnOffEn={onSpeakOnOffEn}
                          flip={flip}
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
