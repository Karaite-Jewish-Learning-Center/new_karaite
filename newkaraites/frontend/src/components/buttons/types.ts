import {MouseEventHandler} from "react";
import {PropTypes} from "@material-ui/core";

export interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface MusicBadgeProps {
    length: number;
    fontSize?: 'default' | 'inherit' | 'large' | 'medium' | 'small';
    color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error';
}

export interface ButtonPropsOnOff {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    onOff: boolean;
}

interface song {
    song_title: string,
    song_file: string,
}

export interface SongList {
      songs: song[]
}

export interface KeyboardsProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    open: boolean;
}

export interface langButton {
    paneNumber: number
}

export interface langButtonReference {
    language: string,
    onClick: MouseEventHandler,
}
