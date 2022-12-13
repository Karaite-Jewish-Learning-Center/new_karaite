import React, {useContext, useEffect, useRef, useState} from 'react'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {AudioBookContext} from "../../stores/audioBookContext";
import {speechContext} from "../../stores/ttspeechContext";
import {audioBooksUrl, versesByBibleBook} from "../../constants/constants";
import {START_AUDIO_BOOK} from "../../constants/constants";
import {messageContext} from "../../stores/messages/messageContext";

const SCROLL_LATENCY_MS = 300
const SCROLL_LATENCY_SECONDS = SCROLL_LATENCY_MS / 1000


const RenderTextGrid = ({paneNumber, onClosePane}) => {
    const store = useContext(storeContext)
    const speech = useContext(speechContext)
    const audioBookStore = useContext(AudioBookContext)
    const message = useContext(messageContext)
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
        }, SCROLL_LATENCY_MS)
    }

    const onTimeUpdate = (currentTime) => {
        const [start, end] = store.getAudioBookStarAndStop(paneNumber)

        if (start === 0 && end === 0) {
            setAudioBookPlaying(false)
            audioBookStore.stop()
            return
        }

        if (currentTime + SCROLL_LATENCY_SECONDS > end) {
            callFromEnded(false)
        }
    }

    const onAudioBookOnOff = () => {
        if (!audioBookPlaying) {
            const audioFile = store.getBookAudioFile(paneNumber)
            audioBookStore.load(`${audioBooksUrl}${audioFile}`, book)
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
        const error = speech.getErrorStatus()
        if(speech.errorAlreadyReported()) return
        if (error === 1) message.setMessage('Hebrew voice not found!')
        if (error === 2) message.setMessage('English voice not found!')
        if (error === 3) message.setMessage('Hebrew and  English voice not found!')
        if(error) speech.setErrorReported(true)

    }, [speech.getErrorStatus()])

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
    }, [store.getCurrentItem(paneNumber), speaking, paneNumber, speech])


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

    const itemContent = (item, data) => <ChapterHeaderVerse
        data={data}
        item={item}
        gridVisibleRange={gridVisibleRange}
        paneNumber={paneNumber}
    />
    const error = speech.getErrorStatus()
    debugger
    return (
        <>
            <RenderHeader book={book}
                          paneNumber={paneNumber}
                          chapter={calculateCurrentChapter()}
                          onClosePane={onClosePane}
                          isSpeechError={speech.getErrorStatus()}
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
