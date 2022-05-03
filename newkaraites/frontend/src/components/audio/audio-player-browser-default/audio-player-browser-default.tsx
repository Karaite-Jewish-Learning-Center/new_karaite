import React, {FC} from "react";
import {Audio} from '../../buttons/types';
import {apiUrl} from '../../../constants/constants'
import {makeStyles} from '@material-ui/core/styles'
import {underLine} from '../../../utils/utils'


const AudioPlayerBrowserDefault: FC<Audio> = ({mp3}) => {
    const classes= useStyles()
    return (
        <audio className={classes.audio}
            controls
            src={`${apiUrl}static-django/audio/${underLine(mp3)}.mp3`}>
        </audio>
    )
}

const useStyles = makeStyles((theme) => ({
    audio: {
        display:'block',
        maxHeight:50,
        borderRadius:0,
    },

}));

export default AudioPlayerBrowserDefault