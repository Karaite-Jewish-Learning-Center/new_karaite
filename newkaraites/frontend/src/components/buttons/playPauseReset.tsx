import React, {FC} from "react"
import IconButton from "@material-ui/core/IconButton";
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import FastRewindIcon from '@material-ui/icons/FastRewind';
import {ButtonPlayProps} from './types';


export const PlayPauseReset: FC<ButtonPlayProps> = ({onClick, onReset, playing, color}) => {

    return (
        <span>
            <IconButton aria-label="Play pause song"
                        component="span"
                        color={color}
                        onClick={onClick}>

                {(playing ? <PauseIcon/> : <PlayArrowIcon/>)}
            </IconButton>
            <IconButton aria-label="Restart song "
                        component="span"
                        color={color}
                        onClick={onReset}>
                {(playing ? <FastRewindIcon/> : null)}
            </IconButton>
    </span>
    )
}