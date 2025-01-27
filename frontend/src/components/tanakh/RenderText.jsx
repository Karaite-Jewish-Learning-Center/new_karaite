import React, {useContext, useEffect, useRef, useState, useCallback} from 'react'
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
    DELAY_TO_START_NEXT_SENTENCE
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

    const callFromEnded = useCallback(() => {
        // avoid useEffect call every render
        // if (audioBookStore.getIsPlaying()) {
        //     store.setCurrentItem(store.getCurrentItem(paneNumber) + 1, paneNumber)
        //     if (store.getDistance(paneNumber) !== 1) {
        //         store.setDistance(1, paneNumber)
        //     }
        // }

        setTimeout(() => {

            virtuoso.current.scrollToIndex({
                index: store.getCurrentItem(paneNumber),
                align: 'start',
                behavior: 'smooth'
            })
            if (speech.ended) {
                store.setCurrentItem(store.getCurrentItem(paneNumber) + 1, paneNumber)
                if (store.getDistance(paneNumber) !== 1) {
                    store.setDistance(1, paneNumber)
                }
                // check language
                if (speech.getLanguage() === 'en') {
                    setTimeout(() => onSpeakOnOffEn(), DELAY_TO_START_NEXT_SENTENCE)
                }
                if (speech.getLanguage() === 'he') {
                    setTimeout(() => onSpeakOnOffHe(), DELAY_TO_START_NEXT_SENTENCE)
                }

            }
        }, SCROLL_LATENCY_MS)
    }, [audioBookStore, paneNumber, store, speech])


    // const onTimeUpdate = (currentTime) => {
    //     const [start, end, id] = store.getAudioBookData(paneNumber)
    //     const lastId = store.getLastId(paneNumber)
    //     // console.log('onTimeUpdate start',start,'end', end,'current time', currentTime)
    //     // console.log('onTimeUpdate id', id ,'last id', lastId, 'current item', store.getCurrentItem(paneNumber))
    //
    //
    //     // if (start === 0 && end === 0) {
    //     //     setAudioBookPlaying(false)
    //     //     audioBookStore.stop()
    //     //     return
    //     // }
    //
    //     if (currentTime + SCROLL_LATENCY_SECONDS > end && lastId === id) {
    //         // console.log('onTimeUpdate callFromEnded', store.getCurrentItem(paneNumber))
    //         callFromEnded()
    //     }
    // }

    // const onAudioBookEnded = () => {
    //     // console.log('onAudioBookEnded', store.getCurrentItem(paneNumber))
    //     setAudioBookPlaying(false)
    //     onAudioBookOnOff()
    // }
    // const onAudioBookOnOff = () => {
    //     console.log('onAudioBookOnOff')
    //     console.log('audioBookPlaying', audioBookPlaying)
    //     if (!audioBookPlaying) {
    //         let audioData = store.getAudioBookData(paneNumber)
    //         store.setLastId(audioData[AUDIO_BOOK_ID], paneNumber)
    //         console.log('onAudioBookOnOff', audioData[AUDIO_BOOK_ID])
    //         const audioFile = store.getBookAudioFile(paneNumber)
    //         audioBookStore.load(`${audioBooksUrl}${audioFile}`, book)
    //         callFromEnded()
    //         audioBookStore.play(audioData[START_AUDIO_BOOK], onTimeUpdate, onAudioBookEnded)
    //         setAudioBookPlaying(true)
    //     } else {
    //         setAudioBookPlaying(false)
    //     }
    //
    // }


    const toggleSpeaking = (lang, flipState) => {
        console.log(`onSpeakOnOff${lang === 'en' ? 'En' : 'He'}`)
        console.log('speaking', speaking)
        console.log('flip', flip)
        speech.setLanguage(lang)
        if (speaking) {
            setSpeaking(false)
            setFlip([false, false])
            speech.cancel()
        } else {
            setFlip(flipState)
            setSpeaking(true)
        }
        console.log('flip', flip)
    }

    const onSpeakOnOffEn = () => toggleSpeaking('en', [false, true])
    const onSpeakOnOffHe = () => toggleSpeaking('he', [true, false])

    useEffect(() => {
        // todo:Move this to the store
        const error = speech.getVoicesStatusError()
        if (speech.errorAlreadyReported()) return
        if (error === 1) message.setMessage('Hebrew voice not found!')
        if (error === 2) message.setMessage('English voice not found!')
        if (error === 3) message.setMessage('Hebrew and  English voice not found!')
        if (error) speech.setErrorReported(true)
    }, [speech, message])

    // useEffect(() => {
    //     return () => {
    //         if (audioBookPlaying) {
    //             audioBookStore.cancel()
    //         }
    //     }
    // }, [audioBookPlaying, audioBookStore])

    useEffect(() => {
        if (speaking) {
            speech.play(store.getBookData(paneNumber)[store.getCurrentItem(paneNumber)], callFromEnded)
        }
        return () => {
            console.log('useEffect speaking', speaking)
            speech.cancel()
        }
    }, [speaking, paneNumber, speech, callFromEnded, store, flip])


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

    const itemContent = (item, data) =>
        <ChapterHeaderVerse
            data={data}
            item={item}
            gridVisibleRange={gridVisibleRange}
            paneNumber={paneNumber}
            audioBookPlaying={audioBookPlaying}
            speaking={speaking}/>

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
                // onAudioBookOnOff={onAudioBookOnOff}
                // audioBookPlaying={audioBookPlaying}
                // isAudioBook={store.isAudioBook(paneNumber)}

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
