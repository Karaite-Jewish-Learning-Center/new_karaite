import React from 'react'

import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../../constants/colors.js';
//import {ttSpeech} from "./ttspeech";


const Player = ({ text, language }) => {
    //let utterThis = new SpeechSynthesisUtterance(text)

    const classes = useStyles()

    // const onDoubleClickEn = () => {
    //     ttSpeech(data[BIBLE_ENGLISH], 'en', 'Daniel', 1, 0.7)
    // }

    // const onDoubleClickHe = () => {
    //     ttSpeech(data[BIBLE_HEBREW], 'he-IL', 'Carmit', 1, 0.7)
    // }

    // const ttSpeech = (text, lang, voice, pitch, rate) => {
    //     let utterThis = new SpeechSynthesisUtterance(text)
    //     let synth = window.speechSynthesis
    //     let voices = synth.getVoices()
    //     // should be moved to config
    //     for (let i = 0; i < voices.length; i++) {
    //         if (voices[i].name === voice) {
    //             utterThis.voice = voices[i]
    //         }
    //     }
    //     utterThis.pitch = pitch
    //     utterThis.rate = rate
    //     synth.speak(utterThis)
    // }
    return (
        <div className={classes.root}>
            <IconButton aria-label="play" disabled>
                <PlayArrowIcon />
            </IconButton>
            <IconButton aria-label="pause" disabled>
                <PauseIcon />
            </IconButton>
            <IconButton aria-label="stop" disabled>
                <StopIcon />
            </IconButton>
            <hr className={classes.ruler} />
        </div>
    )
}


const useStyles = makeStyles((theme) => ({

    ruler: {
        borderColor: Colors.rulerColor,
    },
    headerColor: {
        color: Colors.leftPaneHeader,
        marginTop: 10,
    },
    icon: {
        color: Colors.leftPaneHeader,
        fontSize: 20,
    },
    text: {
        fontSize: 14,
    },
    button: {
        textTransform: 'none',
        justifyContent: 'left',
    },
}));


export default Player