import {MouseEventHandler} from "react";
import {PropTypes} from "@material-ui/core";

export interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface ButtonPlayProps {
    onClick: MouseEventHandler;
    onReset: MouseEventHandler;
    playing: boolean;
    color?: PropTypes.Color;
}

export interface KeyboardsProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    open:boolean;
}

export interface Audio {
    mp3:string,
}



