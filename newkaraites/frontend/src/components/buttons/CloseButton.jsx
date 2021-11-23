import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";

export const CloseButton = ({onClick}) =>
    <IconButton aria-label="Close pane" component="span" onClick={onClick}><CloseIcon/></IconButton>

