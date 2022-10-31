import {useEffect, useState, useMemo} from "react";
import {apiUrlNoSlash} from "../../constants/constants";

export const useAudio = (song, onResetPlayer, autoplay) => {

    const url = `${apiUrlNoSlash}${song}`;

    const [audio] = useState(useMemo(() => {
        try {
            let audio = new Audio(url)
            audio.crossOrigin = 'anonymous'
            return audio
        } catch (e) {
            alert('Audio error')
        }
    }, [url]))


    const [playing, setPlaying] = useState(autoplay);

    const toggle = () => setPlaying(!playing);

    const reset =()=> {
        setPlaying(false)
        audio.pause()
        audio.currentTime = 0

        if(onResetPlayer!==null) onResetPlayer()
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

    useEffect(() => {
        audio.addEventListener('ontimeupdate', () =>console.log('track' + audio.currentTime.toString()));
        return () => {
            audio.removeEventListener('ontimeupdate',() =>console.log(autoplay.currentTime.toString()));
        };
    } );

    return [playing, toggle, reset];
};

