import React, {useState} from 'react'
import {TextToSpeechButton} from "../components/buttons/textToSpeechButton";


const TextToSpeech = ({text, language}) => {
    const [speaking, setSpeaking] = useState(false)

    let utter = new SpeechSynthesisUtterance(text)
    let voices = speechSynthesis.getVoices()
    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === 'Daniel') {
            utter.voice = voices[i]
        }
    }
    utter.volume = 10
    utter.pitch = 1
    utter.rate = 0.7
    utter.lang = language

    const speak = () => {
        speechSynthesis.cancel()
        speechSynthesis.speak(utter)
    }

    utter.onend = () => {
        setSpeaking(false)
    }
    utter.onstart = () => {
        setSpeaking(true)
    }

    return <TextToSpeechButton onClick={speak} onOff={speaking}/>

}


export default TextToSpeech