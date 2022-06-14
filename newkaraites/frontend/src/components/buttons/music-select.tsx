import React, {FC, MouseEvent, useState} from 'react'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {SongList} from './types';
import {BasicAudioPlayer} from '../audio/audio-player/basic-audio-player';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import IconButton from "@material-ui/core/IconButton";
import {toJS} from 'mobx';
import {removeExtension} from '../../utils/utils';


export const MusicSelect: FC<SongList> = ({songs}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const [song, setSong] = useState<string>('');

    if (songs.length === 0) return null
    if (songs.length === 1) return <BasicAudioPlayer song={songs} onResetPlayer={()=>{}} autoplay={false}/>

    const selectSong = (song:string) => {
        setAnchorEl(null)
        setSong(song)
    }
    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }
    const onResetPlayer = ():void => {
        setSong('')
    }

    if(song !='' && song != undefined) {
        return <BasicAudioPlayer song={song} onResetPlayer={onResetPlayer} autoplay={true}/>
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

                {songs.map((song, index) => <MenuItem key={index} onClick={()=>{selectSong(song['song_file'])}}>{removeExtension(song['song_title'])}</MenuItem>)}
            </Menu>
        </span>
    )
}