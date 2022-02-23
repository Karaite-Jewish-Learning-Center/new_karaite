import React, {FC} from "react";
import TocIcon from "@material-ui/icons/Toc";
import IconButton from "@material-ui/core/IconButton";
import ButtonProps from './types';

export const TocButton: FC<ButtonProps> = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <TocIcon/>
    </IconButton>

