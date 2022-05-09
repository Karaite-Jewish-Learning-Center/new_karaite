import React, {useEffect, useState} from "react";
import {apiUrl} from "../../constants/constants";
import {AudioTypeArray} from '../buttons/types';


export const useAudio= (song:string) => {
    song = song.replace(/‘/g, '').replace(/e’/g, '').replace(/é/g, '').replace(/e’/g, '')

    const [audio] = useState(new Audio(`${apiUrl}static-django/audio/${song}.wav`));
    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    const reset = () => {
        setPlaying(false)
        audio.pause()
        audio.currentTime = 0
    }

    useEffect(() => {
            playing ? audio.play() : audio.pause();
        },
        [playing]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
            reset()
        };
    }, []);

    return [playing, toggle, reset];
};

