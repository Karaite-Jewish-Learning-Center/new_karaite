import React from 'react';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import {indoArabicToHebrew, englishBookNameToHebrew} from "../utils/utils";
import {LANGUAGE, HEBREW} from "../constants/constants";
import {resources} from "../constants/common-css";


const CommentRef = ({book, chapter, verse, language, closeCommentTabHandler, biblicalRef}) => {
    const classes = resources()
    let link
    if (language === HEBREW) {
        link = `${englishBookNameToHebrew(book)} ${indoArabicToHebrew(chapter)}:${indoArabicToHebrew(verse)}`
    } else {
        link = `${book} ${chapter}:${verse}`
    }

    return (
        <div className={classes.resources}>
            <Box display="flex" direction="row" justifyContent="space-between" p={1} m={1} className={classes.grid}>
                <Box p={1} alignContent="flex-start" className={classes.link}>
                    <span lang={LANGUAGE[language]}
                          className={LANGUAGE[language] + '-biblical-ref'}
                          onClick={biblicalRef}>{link}
                    </span>
                </Box>
                <Box p={1} m={10} alignContent="flex-end" className={classes.iconGrid}>
                    <IconButton
                        aria-label="Close comments pane"
                        component="span"
                        onClick={closeCommentTabHandler}
                    >
                        <HighlightOffIcon className={classes.iconGrid}/>
                    </IconButton>
                </Box>
            </Box>
        </div>
    )
}


export default CommentRef