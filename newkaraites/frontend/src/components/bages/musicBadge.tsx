import React, {FC} from "react";
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import {MusicBadgeProps} from '../buttons/types';


export const MusicBadge: FC<MusicBadgeProps> = (props) => {
    if (props.length === 0) {
        return null
    }

    const {length = 0, fontSize = "small", color = "secondary"} = props;
    return (length > 1 ?
        <QueueMusicIcon fontSize={fontSize} color={color}/> :
        <MusicNoteIcon fontSize={fontSize} color={color}/>)
}


