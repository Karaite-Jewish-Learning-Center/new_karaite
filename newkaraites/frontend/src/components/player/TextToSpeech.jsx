import React, {useState} from 'react'
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import {makeStyles} from '@material-ui/core/styles'
import Colors from '../../constants/colors.js'


const TextToSpeech = ({text, language}) => {
    const classes = useStyles()
    const [speaking, setSpeaking] = useState(false)
    const [paused, setPaused] = useState(false)

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
        setSpeaking(() => true)
        //setPaused(true)
    }
    const pause = () => {
        if (paused) {
            speechSynthesis.pause()
            setPaused(() => true)
            setSpeaking(() => false)
        } else {
            speechSynthesis.resume()
            setPaused(() => false)
            setSpeaking(() => true)
        }
    }
    const stop = () => {
        speechSynthesis.cancel()
        setSpeaking(() => false)
    }
    console.log(speaking)
    return (
        <div className={classes.root}>
            <IconButton aria-label="play">
                {speaking ? <PlayArrowIcon onClick={speak}/> : <PauseIcon onClick={pause}/>}
            </IconButton>
            {/*<IconButton aria-label="pause" disabled={!paused}>*/}
            {/*    <PauseIcon onClick={pause}/>*/}
            {/*</IconButton>*/}
            {/*<IconButton aria-label="stop" disabled={!speaking}>*/}
            {/*    <StopIcon onClick={stop}/>*/}
            {/*</IconButton>*/}
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {},
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


export default TextToSpeech