import React, {FC, MouseEvent, useState} from 'react'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {SongList} from './types';
import {BasicAudioPlayer} from '../audio/audio-player/basic-audio-player';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import IconButton from "@material-ui/core/IconButton";
import {toJS} from 'mobx';



export const MusicSelect: FC<SongList> = ({songs}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const [index, setIndex] = useState(-1);

    if (songs.length === 0) return null
    if (songs.length === 1) return <BasicAudioPlayer song={songs} onResetPlayer={()=>{}} autoplay={false} index={0}/>

    const selectSong = (i:number) => {
        setAnchorEl(null)
        setIndex(i)
    }
    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }
    const onResetPlayer = ():void => {
        setIndex(-1)
    }

    if(index  != -1) {
        return <BasicAudioPlayer song={songs} onResetPlayer={onResetPlayer} autoplay={true} index={index}/>
    }

    return (
        <span>
            <IconButton aria-label="Open music selector" aria-controls="select-music" onClick={onClick} color={"inherit"}>
                <PlaylistPlayIcon aria-controls="Select music from list" />
            </IconButton>
            <Menu
                id="select-music"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={selectSong}>
                {songs.map((song, index) => <MenuItem key={index} onClick={()=>{selectSong(index)}}>{song['song_title']}</MenuItem>)}
            </Menu>
        </span>
    )
}