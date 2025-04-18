import { PropTypes } from "@material-ui/core";
import { MouseEventHandler } from "react";

export interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface MusicBadgeProps {
    length: number;
    audio: boolean;
    fontSize?: 'default' | 'inherit' | 'large' | 'medium' | 'small';
    color?: 'inherit' | 'primary' | 'secondary' | 'action' | 'disabled' | 'error';
}

export interface ButtonPropsOnOff {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    onOff: boolean;
    isSpeechError?: boolean;
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
