import {useEffect, useState, useMemo} from "react";
import {apiUrl} from "../../constants/constants";

export const useAudio = (song) => {
    song = song.replace(/‘/g, '').replace(/e’/g, '').replace(/é/g, '').replace(/e’/g, '')

    const url = `${apiUrl}static-django/audio/${song}.wav`

    const [audio] = useState(useMemo(() => {
        return new Audio(url)
    }, [url]))


    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    const reset =()=> {
        setPlaying(false)
        audio.pause()
        audio.currentTime = 0
    }

    useEffect(() => {
            playing ? audio.play() : audio.pause();
        },
        [playing,audio]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
            audio.pause()
            audio.currentTime = 0
        };
    } );

    return [playing, toggle, reset];
};

