import React, {useState, useEffect} from "react";
import {apiUrl} from '../../../constants/constants'
import {underLine} from '../../../utils/utils'
import {PlayPauseReset} from '../../buttons/playPauseReset'


export const BasicAudioPlayer = ({mp3, songStop}) => {
    const useAudio = (mp3) => {

        const [audio] = useState(new Audio(`${apiUrl}static-django/audio/${underLine(mp3)}.mp3`));
        const [playing, setPlaying] = useState(false);

        const toggle = () => setPlaying(!playing);

        const reset = () => audio.currentTime = 0

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
    const [playing, toggle, reset] = useAudio(mp3);

    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}/>
}


