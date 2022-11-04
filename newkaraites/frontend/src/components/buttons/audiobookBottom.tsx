import React, {FC} from "react";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import IconButton from "@material-ui/core/IconButton";
import {ButtonPropsOnOff} from './types';


export const AudiobookBottom: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        {( ! onOff ? <PlayArrowIcon/>: <PauseIcon/>)}
    </IconButton>

