import {MouseEventHandler, MouseEvent} from "react";
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
export interface ButtonPropsTTS {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    onOff: boolean;
}

export interface ButtonPlayProps {
    onClick: MouseEventHandler;
    playing: boolean;
    onReset: MouseEventHandler;
    color?: PropTypes.Color;
    song: string;
}

interface song {
    song_title: string,
    song_file: string,
}

// interface SongType {
//      readonly [index:number]:song
// }

export interface SongList {
      songs: song[]
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


export interface langButton {
    paneNumber: number
}

export interface langButtonReference {
    language: string,
    onClick: MouseEventHandler,
}


