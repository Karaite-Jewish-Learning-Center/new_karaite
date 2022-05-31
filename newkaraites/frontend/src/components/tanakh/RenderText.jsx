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
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const [speakingOnOff, setSpeakingOnOff] = useState(false)
    const [index, setIndex] = useState(store.getCurrentItem(paneNumber))
    const virtuoso = useRef(null)

    const onSpeakOnOff = () => {
        if(!speech.getPlaying()) {
            speech.play(store.getBookData(paneNumber)[index][0])
        }
        if(speech.paused) {
            speech.resume()
        }
        if(speech.getResumed()) {
            speech.pause()
        }
    }

    // useEffect(() => {
    //
    //     if (speakingOnOff) {
    //         const utter = new SpeechSynthesisUtterance(store.getBookData(paneNumber)[index][0])
    //         const voices = speechSynthesis.getVoices()
    //         console.log(voices)
    //         for (let i = 0; i < voices.length; i++) {
    //             if (voices[i].name === 'Daniel') {
    //                 utter.voice = voices[i]
    //             }
    //         }
    //         utter.volume = 10
    //         utter.pitch = 1
    //         utter.rate = 0.7
    //         utter.lang = 'en'
    //
    //         utter.onend = function (event) {
    //             setTimeout(() => {
    //                 // @ts-ignore
    //                 virtuoso.current.scrollToIndex({
    //                     index: index +1,
    //                     align: 'top',
    //                     behavior: 'smooth',
    //                 })
    //             }, 300)
    //             setIndex(index+1)
    //         }
    //         speechSynthesis.speak(utter)
    //     }
    //
    //
    // }, [index,speakingOnOff, paneNumber])

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
                speaking={speakingOnOff}
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
