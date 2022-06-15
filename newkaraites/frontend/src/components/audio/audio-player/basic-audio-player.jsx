import React from "react";
import {useAudio} from "../../hooks/useAudio";
import {PlayPauseReset} from '../../buttons/playPauseReset'
import {toJS} from 'mobx';

export const BasicAudioPlayer = ({song, onResetPlayer , autoplay, index}) => {
    const x = toJS(song)
    debugger
    const song_title = song[index]['song_title']
    const song_file = song[index]['song_file']
    debugger
    const [playing, toggle, reset] = useAudio(song_file, onResetPlayer, autoplay);
    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}  song={song_title} />
}
