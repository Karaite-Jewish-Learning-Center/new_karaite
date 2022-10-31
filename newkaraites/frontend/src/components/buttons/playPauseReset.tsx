import React, {FC, useContext} from "react"
import IconButton from "@material-ui/core/IconButton";
import PauseIcon from '@material-ui/icons/Pause'
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import FastRewindIcon from '@material-ui/icons/FastRewind';
import {ButtonPlayProps} from './types';
import {messageContext} from '../../stores/messages/messageContext';



export const  PlayPauseReset: FC<ButtonPlayProps> = ({onClick, onReset, playing, color, song}) => {
    const [mouseEnter, setMouseEnter] = React.useState(false);
    const message = useContext(messageContext);
    const onMouseEnter = () => {
        if (!mouseEnter) {
            setMouseEnter(true);
            message.setMessage(`Playing ${song}`, 'info');
        }
    }
    const onMouseLeave = () => {
        setMouseEnter(false);
    }

    return (
        <span>
            <IconButton saria-label="Play pause song"
                        component="span"
                        onClick={onClick}>

                {(playing ? <PauseIcon onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}/> : <PlayArrowIcon/>)}
            </IconButton>
            <IconButton aria-label="Restart song "
                        component="span"
                        onClick={onReset}>
                {(playing ? <FastRewindIcon/> : null)}
            </IconButton>
    </span>
    )
}