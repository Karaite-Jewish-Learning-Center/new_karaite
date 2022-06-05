import React, {FC, MouseEvent, MouseEventHandler, useState} from 'react'
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {SongList} from './types';
import {BasicAudioPlayer} from '../audio/audio-player/basic-audio-player';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import IconButton from "@material-ui/core/IconButton";
import {removeExtension} from '../../utils/utils';


export const MusicSelect: FC<SongList> = ({songs}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
    const [song, setSong] = useState<string>('');
    if (songs.length === 0) return null
    if (songs.length === 1) return <BasicAudioPlayer song={songs[0]}/>

    const selectSong = (index:number) => {
        setAnchorEl(null)
        setSong(songs[index] as unknown as string)
    }
    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    if(song !='') {
        return <BasicAudioPlayer song={song}/>
    }

    return (
        <span>
            <IconButton aria-label="Open music selector" aria-controls="select-music" onClick={onClick}>
                <PlaylistPlayIcon aria-controls="Select music from list"/>
            </IconButton>
            <Menu
                id="select-music"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={selectSong}>
                {songs.map((song, index) => <MenuItem key={index} onClick={()=>{selectSong(index)}}>{removeExtension(song as unknown as string)}</MenuItem>)}
            </Menu>
        </span>
    )
}