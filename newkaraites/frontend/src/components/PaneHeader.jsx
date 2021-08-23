import React from 'react'
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Typography from '@material-ui/core/Typography';
import { resources } from "../constants/common-css";
import { indoArabicToHebrew, englishBookNameToHebrew } from "../utils/utils";
import { LANGUAGE, HEBREW } from "../constants/constants";


export default function PaneHeader({ book, chapter, verse, onClosePane }) {
    const classes = resources()

    return (
        <div className={classes.resources}>
            <Box display="flex" direction="row" justifycontent="space-between" p={1} m={1} className={classes.grid}>
                <Box p={1} alignContent="flex-start" className={classes.link}>
                    <Typography>{book} {chapter}{(verse !== undefined ? ':' : '')}{verse}</Typography>
                    {/*<span lang={LANGUAGE[language]}*/}
                    {/*      class={LANGUAGE[language] + '-biblical-ref'}*/}
                    {/*      onClick={biblicalRef}>{link}*/}
                    {/*</span>*/}
                </Box>
                {onClosePane !== undefined ?
                    <Box p={1} m={10} alignContent="flex-end" className={classes.iconGrid}>
                        <IconButton className={classes.iconButton}
                            aria-label="Close comments pane"
                            component="span"
                            onClick={onClosePane}
                        >
                            <HighlightOffIcon className={classes.iconGrid} />
                        </IconButton>
                    </Box>
                    : null}
            </Box>
        </div>
    )
}

