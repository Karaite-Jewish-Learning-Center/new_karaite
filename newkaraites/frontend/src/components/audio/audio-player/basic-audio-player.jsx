import React from "react";
import {useAudio} from "../../hooks/useAudio";
import {PlayPauseReset} from '../../buttons/playPauseReset'


export const BasicAudioPlayer = ({song, onResetPlayer , autoplay}) => {
    const [playing, toggle, reset] = useAudio(song, onResetPlayer, autoplay);
    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}  song={song} />
}
