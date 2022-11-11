import React, {useContext, useEffect, useRef, useState} from 'react'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {AudioBookContext} from "../../stores/audioBookContext";
import {speechContext} from "../../stores/ttspeechContext";
import {versesByBibleBook} from "../../constants/constants";
import {START_AUDIO_BOOK} from "../../constants/constants";


const RenderTextGrid = ({paneNumber, onClosePane}) => {
    const store = useContext(storeContext)
    const speech = useContext(speechContext)
    const audioBookStore = useContext(AudioBookContext)
    const book = store.getBook(paneNumber)
    const [speaking, setSpeaking] = useState(false)
    const [audioBookPlaying, setAudioBookPlaying] = useState(false)
    const [flip, setFlip] = useState([false, false])
    const [gridVisibleRange, setGridVisibleRange] = useState({startIndex: 0, endIndex: 0})
    const virtuoso = useRef(null)


    const callFromEnded = (set = true) => {
        store.setCurrentItem(store.getCurrentItem(paneNumber) + 1, paneNumber)
        setTimeout(() => {
            //     @ts-ignore
            virtuoso.current.scrollToIndex({
                index: store.getCurrentItem(paneNumber),
                align: (store.getDistance(paneNumber) <= 1 ? 'top' : 'center'),
                behavior: 'smooth',
            })
            // speech synthesis only!
            if (set) setSpeaking(() => true)
        }, 300)
    }

    const onTimeUpdate = (currentTime) => {
        const [start, end] = store.getAudioBookStarAndStop(paneNumber)

        if (start === 0 && end === 0) {
            setAudioBookPlaying(false)
            audioBookStore.stop()
            return
        }

        if (currentTime > end) {
            callFromEnded(false)
        }
    }

    const onAudioBookOnOff = () => {
        if (!audioBookPlaying) {
            setAudioBookPlaying(() => true)
            audioBookStore.play(store.getAudioBookStarAndStop(paneNumber)[START_AUDIO_BOOK], onTimeUpdate)
        } else {
            setAudioBookPlaying(() => false)
            audioBookStore.pause()
        }
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
        return () => {
            if (audioBookPlaying) {
                audioBookStore.cancel()
            }
        }
    }, [audioBookPlaying])

    useEffect(() => {
        if (speaking) {
            speech.play(store.getBookData(paneNumber)[store.getCurrentItem(paneNumber)], callFromEnded)
        }
        return () => {
            speech.cancel()
        }
    }, [store.getCurrentItem(paneNumber), speaking, paneNumber, speech, store])


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
                          onSpeakOnOffHe={onSpeakOnOffHe}
                          onSpeakOnOffEn={onSpeakOnOffEn}
                          flip={flip}
                          onAudioBookOnOff={onAudioBookOnOff}
                          audioBookPlaying={audioBookPlaying}
                          isAudioBook={store.isAudioBook(paneNumber)}
            />

            <Virtuoso
                data={store.getBookData(paneNumber)}
                ref={virtuoso}
                // initialTopMostItemIndex={3}
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
