import React, {useContext, useEffect, useRef, useState} from 'react'
import Loading from '../general/Loading'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {versesByBibleBook} from "../../constants/constants";


const RenderTextGrid = ({paneNumber, onClosePane}) => {
    const store = useContext(storeContext)
    const book = store.getBook(paneNumber)
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const [loadingMessage, setLoadingMessage] = useState(null)
    const [speakingOnOff, setSpeakingOnOff] = useState(false)
    const virtuoso = useRef(null);

    const onSpeakOnOff = () => {
        setSpeakingOnOff(!speakingOnOff)
    }

    console.log(store.getVerseData(paneNumber)[0])
    let utter = new SpeechSynthesisUtterance(store.getVerseData(paneNumber)[0])
    let voices = speechSynthesis.getVoices()
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === 'Daniel') {
            utter.voice = voices[i]
        }
    }

    utter.volume = 10
    utter.pitch = 1
    utter.rate = 0.7
    utter.lang = 'en'

    utter.onend = function (event) {
        if (speakingOnOff) {
            console.log('Speech has finished')
            setTimeout(() => {
                // @ts-ignore
                virtuoso.current.scrollToIndex({
                    index:store.getCurrentItem(paneNumber)+1,
                    align: 'top',
                    behavior: 'smooth',
                })
            }, 100)
        }
    }

    useEffect(() => {
        if (speakingOnOff && !speechSynthesis.speaking) {
            speechSynthesis.speak(utter)
        }
    }, [speakingOnOff])


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
            <RenderHeader book={book}
                          paneNumber={paneNumber}
                          chapter={calculateCurrentChapter()}
                          onClosePane={onClosePane}
                          speaking={speakingOnOff}
                          speak={onSpeakOnOff}
            />

            <Virtuoso
                data={store.getBookData(paneNumber)}
                ref={virtuoso}
                endReached={(_) => setLoadingMessage(() => 'Book end.')}
                initialTopMostItemIndex={parseInt(store.getCurrentItem(paneNumber))}
                rangeChanged={setGridVisibleRange}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return <Loading text={loadingMessage}/>
                    }
                }}
            />
        </>
    )
}


export default observer(RenderTextGrid)

