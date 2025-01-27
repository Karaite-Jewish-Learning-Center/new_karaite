import React, {FC} from "react";
import IconButton from "@material-ui/core/IconButton";
import KeyboardIcon from '@material-ui/icons/Keyboard';
import KeyboardHideIcon from '@material-ui/icons/KeyboardHide';
import {KeyboardsProps} from './types';


export const KeyboardButton: FC<KeyboardsProps> = ({onClick, color, open}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        { open ? <KeyboardHideIcon/> :<KeyboardIcon/> }
    </IconButton>

