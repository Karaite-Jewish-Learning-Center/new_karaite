import React from "react";
import {useAudio} from "../../hooks/useAudio";
import {PlayPauseReset} from '../../buttons/playPauseReset'


export const BasicAudioPlayer = ({song}) => {
    const [playing, toggle, reset] = useAudio(song);
    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}/>
}
