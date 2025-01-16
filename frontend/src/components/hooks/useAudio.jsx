import {useEffect, useState, useMemo} from "react";
import {songsUrl} from "../../constants/constants";

export const useAudio = (song, onResetPlayer, autoplay) => {

    const url = `${songsUrl}${song}`;
    const [audio] = useState(useMemo(() => {
        try {
            let audio = new Audio()
            audio.src = url
            audio.crossOrigin = '*'

            return audio
        } catch (e) {
            alert('Audio error')
        }
    }, [url]))

    const [playing, setPlaying] = useState(autoplay);

    const toggle = () => setPlaying(!playing);

    const reset = () => {
        setPlaying(false)
        audio.pause()
        audio.currentTime = 0

        if (onResetPlayer !== null) onResetPlayer()
    }

    useEffect(() => {
            playing ? audio.play() : audio.pause();
        },
        [playing, audio]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
            audio.pause()
            audio.currentTime = 0
        };
    });


    return [playing, toggle, reset];
};

