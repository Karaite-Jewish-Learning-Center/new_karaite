import React, {useContext, useEffect, useRef, useState} from 'react'
import {Virtuoso} from 'react-virtuoso'
import ChapterHeaderVerse from './ChapterHeaderVerse'
import RenderHeader from './RenderHeader'
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {AudioBookContext} from "../../stores/audioBookContext";
import {speechContext} from "../../stores/ttspeechContext";
import {audioBooksUrl, versesByBibleBook} from "../../constants/constants";
import {
    START_AUDIO_BOOK,
    AUDIO_BOOK_ID,
    SCROLL_LATENCY_MS,
    SCROLL_LATENCY_SECONDS,
} from "../../constants/constants";
import {messageContext} from "../../stores/messages/messageContext";


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

        if (audioBookStore.getIsPlaying()) {
            store.setCurrentItem(store.getCurrentItem(paneNumber) + 1, paneNumber)
            if (store.getDistance(paneNumber) !== 1) {
                store.setDistance(1, paneNumber)
            }
        }

        setTimeout(() => {
            //     @ts-ignore
            virtuoso.current.scrollToIndex({
                index: store.getCurrentItem(paneNumber),
                align: 'start',
                behavior: 'smooth'
            })
            // speech synthesis only!
            if (set) setSpeaking(() => true)
        }, SCROLL_LATENCY_MS)
    }

    const onTimeUpdate = (currentTime) => {
        const [start, end, id] =store.getAudioBookData(paneNumber)
        const lastId = store.getLastId(paneNumber)
        // console.log('onTimeUpdate start',start,'end', end,'current time', currentTime)
        // console.log('onTimeUpdate id', id ,'last id', lastId, 'current item', store.getCurrentItem(paneNumber))


        if (start === 0 && end === 0) {
            setAudioBookPlaying(false)
            audioBookStore.stop()
            return
        }

        if ( currentTime + SCROLL_LATENCY_SECONDS > end && lastId === id) {
            // console.log('onTimeUpdate callFromEnded', store.getCurrentItem(paneNumber))
            callFromEnded(false)
        }
    }

    const onAudioBookEnded = () => {
        // console.log('onAudioBookEnded', store.getCurrentItem(paneNumber))
        setAudioBookPlaying(() => false)
        onAudioBookOnOff()
    }
    const onAudioBookOnOff = () => {

        if (!audioBookPlaying) {
            let audioData  = store.getAudioBookData(paneNumber)
            store.setLastId(audioData[AUDIO_BOOK_ID], paneNumber)
            // console.log('onAudioBookOnOff', audioData[AUDIO_BOOK_ID])
            const audioFile = store.getBookAudioFile(paneNumber)
            audioBookStore.load(`${audioBooksUrl}${audioFile}`, book)
            // callFromEnded(false)
            audioBookStore.play(audioData[START_AUDIO_BOOK], onTimeUpdate, onAudioBookEnded)
            setAudioBookPlaying(() => true)
        } else {
            setAudioBookPlaying(() => false)
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
        // todo:Move this to the store
        const error = speech.getVoicesStatusError()
        if (speech.errorAlreadyReported()) return
        if (error === 1) message.setMessage('Hebrew voice not found!')
        if (error === 2) message.setMessage('English voice not found!')
        if (error === 3) message.setMessage('Hebrew and  English voice not found!')
        if (error) speech.setErrorReported(true)

    })

    useEffect(() => {
        return () => {
            if (audioBookPlaying) {
                audioBookStore.cancel()
            }
        }
    }, [audioBookPlaying])

    useEffect(() => {
        if (speaking) {
            debugger
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
        audioBookPlaying={audioBookPlaying}
        speaking={speaking}

    />
    let currentChapter = calculateCurrentChapter()

    return (
        <>
            <RenderHeader book={book}
                          paneNumber={paneNumber}
                          chapter={currentChapter}
                          onClosePane={onClosePane}
                          isSpeechError={speech.getVoicesStatusError()}
                          onSpeakOnOffHe={onSpeakOnOffHe}
                          onSpeakOnOffEn={onSpeakOnOffEn}
                          flip={flip}
                          onAudioBookOnOff={onAudioBookOnOff}
                          audioBookPlaying={audioBookPlaying}
                          isAudioBook={store.isAudioBook(paneNumber)}

            />
            {/* must update current item when click on torah Portions */}
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
