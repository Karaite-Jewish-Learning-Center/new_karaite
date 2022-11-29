import React, {useContext, useEffect, useState, FC} from "react";
import {AudioBookContext} from "../../../stores/audioBookContext";
import {messageContext} from "../../../stores/messages/messageContext";
import IconButton from "@material-ui/core/IconButton";
import PauseIcon from "@material-ui/icons/Pause";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import FastRewindIcon from "@material-ui/icons/FastRewind";
import {songsUrl} from "../../../constants/constants";

interface SongProps {
    song: {'song_file':string, song_title:string}[];
    index: number;
}

export const BasicAudioPlayer:FC<SongProps> = ({song, index}) => {

    const message = useContext(messageContext);
    const audioBookStore = useContext(AudioBookContext)
    const [mouseEnter, setMouseEnter] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [paused, setPaused] = useState(false);

    const onMouseEnter = () => {
        if (!mouseEnter) {
            setMouseEnter(true);
            message.setMessage(`Playing ${song[index]['song_title']}`, 'info');
        }
    }

    const onMouseLeave = () => {
        setMouseEnter(false);
    }

    const play = () => {
        if (playing) {
            setPlaying(false);
            pause();
        } else {
            setPlaying(true);
            audioBookStore.play()
        }
    }

    const pause = () => {
        if (paused) {
            setPaused(false)
            audioBookStore.resume()
        } else {
            setPaused(true)
            audioBookStore.pause()
        }
    }

    const reset = () => {
        setPlaying(false);
        setPaused(false);
        audioBookStore.reset()
    }

    useEffect(() => {
        audioBookStore.load(`${songsUrl}${song[index]['song_file']}`, song[index]['song_title'])
        return () => {
            audioBookStore.stop()
        }
    }, [index, song, audioBookStore])

    return (
        <span>
            <IconButton saria-label="Play pause song"
                        component="span"
                        onClick={play}>
                {(playing ? <PauseIcon onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}/> : <PlayArrowIcon/>)}
            </IconButton>
            <IconButton aria-label="Restart song "
                        component="span"
                        onClick={reset}>
                {(playing ? <FastRewindIcon/> : null)}
            </IconButton>
    </span>
    )
}


