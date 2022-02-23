import React, {FC} from "react";
import MenuBookButton from "@material-ui/icons/MenuBook";
import IconButton from "@material-ui/core/IconButton";
import ButtonProps from './types';


export const BookButton: FC<ButtonProps> = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <MenuBookButton/>
    </IconButton>

