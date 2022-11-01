import React from "react";
import {useAudio} from "../../hooks/useAudio";
import {PlayPauseReset} from '../../buttons/playPauseReset'


export const audioBook = ({song, onResetPlayer , autoplay, index}) => {
    const song_title = song[index]['song_title']
    const song_file = song[index]['song_file']
    const [playing, toggle, reset] = useAudio(song_file, onResetPlayer, autoplay);
    return <PlayPauseReset onClick={toggle} playing={playing} onReset={reset}  song={song_title} />
}
