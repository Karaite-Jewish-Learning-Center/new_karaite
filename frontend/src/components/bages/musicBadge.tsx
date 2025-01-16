import React, {FC} from "react";
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';

import {MusicBadgeProps} from '../buttons/types';


export const MusicBadge: FC<MusicBadgeProps> = (props) => {
    const {length = 0, audio = false, fontSize = "small", color = "secondary"} = props;

    if (length === 0 && !audio) return null;

    if(audio ) return <LibraryMusicIcon fontSize={fontSize} color={color}/>

    return (length > 1 ? <QueueMusicIcon fontSize={fontSize} color={color}/> : <MusicNoteIcon fontSize={fontSize} color={color}/>)
}


