import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Typography from '@material-ui/core/Typography';
import Colors from "../constants/colors";
import {indoArabicToHebrew, englishBookNameToHebrew} from "../utils/utils";
import {LANGUAGE, HEBREW} from "../constants/constants";


export default function PaneHeader({book, chapter, onClosePane}) {
    const classes = useStyles()

    return (
        <div className={classes.resources}>
            <Box display="flex" direction="row" justifyContent="space-between" p={1} m={1} className={classes.grid}>
                <Box p={1} alignContent="flex-start" className={classes.link}>
                    <Typography>{book} {chapter}</Typography>
                    {/*<span lang={LANGUAGE[language]}*/}
                    {/*      class={LANGUAGE[language] + '-biblical-ref'}*/}
                    {/*      onClick={biblicalRef}>{link}*/}
                    {/*</span>*/}
                </Box>
                <Box p={1} m={10} alignContent="flex-end" className={classes.iconGrid}>
                    <IconButton className={classes.iconButton}
                        aria-label="Close comments pane"
                        component="span"
                        onClick={onClosePane}
                    >
                        <HighlightOffIcon className={classes.iconGrid}/>
                    </IconButton>
                </Box>
            </Box>
        </div>
    )
}


const useStyles = makeStyles({
    resources: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
    grid: {
        padding: 0,
        marginRight: 0,
    },
    iconGrid: {
        margin: 0,
        padding: 0,

    },
    iconButton:{
        marginRight:12
    }

})
