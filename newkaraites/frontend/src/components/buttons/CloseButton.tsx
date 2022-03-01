import React, {FC} from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import ButtonProps from './types';


export const CloseButton: FC<ButtonProps> = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <CloseIcon/>
    </IconButton>

