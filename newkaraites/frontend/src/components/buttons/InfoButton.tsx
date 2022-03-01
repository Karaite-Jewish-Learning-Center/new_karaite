import React, {FC} from "react";
import InfoIcon from "@material-ui/icons/Info";
import IconButton from "@material-ui/core/IconButton";
import ButtonProps from './types';

export const InfoButton: FC<ButtonProps> = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <InfoIcon/>
    </IconButton>

