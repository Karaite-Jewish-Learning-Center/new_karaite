import React, {useState, useEffect} from "react";
import {apiUrl} from '../../../constants/constants'
import {PlayPauseReset} from '../../buttons/playPauseReset'

export const BasicAudioPlayer = ({song, songStop}) => {
    const useAudio = (song) => {
        song = song.replace(/‘/g, '').replace(/e’/g,'').replace(/é/g,'').replace(/e’/g,'')
        debugger
        const [audio] = useState(new Audio(`${apiUrl}static-django/audio/${song}.wav`));
        const [playing, setPlaying] = useState(false);

        const toggle = () => setPlaying(!playing);

        const reset = () => {
            setPlaying(false)
            audio.pause()
            audio.currentTime = 0
        }

        useEffect(() => {
                playing ? audio.play() :  audio.pause();
            },
            [playing,songStop]
        );

        useEffect(() => {
            audio.addEventListener('ended', () => setPlaying(false));
            return () => {
                audio.removeEventListener('ended', () => setPlaying(false));
            };
        }, []);

        return [playing, toggle, reset];
    };
    const [playing, toggle, reset] = useAudio(song);

    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}/>
}


