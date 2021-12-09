import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

export const CloseButton = ({onClick, color = "inherit"}) =>
    <IconButton aria-label="Close"
                component="span"
                color={color}
                onClick={onClick}>
        <CloseIcon/>
    </IconButton>

