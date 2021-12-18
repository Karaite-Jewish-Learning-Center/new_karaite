import React, {FC, MouseEventHandler} from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import {PropTypes} from '@material-ui/core';

interface CloseProps {
    onClick: MouseEventHandler;
    color: PropTypes.Color;
}

export const CloseButton: FC<CloseProps> = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <CloseIcon/>
    </IconButton>

