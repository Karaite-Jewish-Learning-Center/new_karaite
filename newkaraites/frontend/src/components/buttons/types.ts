import {MouseEventHandler, MouseEvent} from "react";
import {PropTypes} from "@material-ui/core";

export interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface ButtonPlayProps {
    onClick: MouseEventHandler;
    playing: boolean;
    onReset: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface Song {
    song: string
}

interface AudioType {
    onClick: MouseEvent<HTMLButtonElement>,
    onReset: MouseEvent<HTMLButtonElement>,
    playing: boolean,
}

export type AudioTypeArray = AudioType[];


export interface KeyboardsProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    open: boolean;
}

export interface Audio {
    mp3: string,
}



