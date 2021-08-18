import React from 'react';
import { Grid } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { indoArabicToHebrew, englishBookNameToHebrew } from "../utils/utils";
import { LANGUAGE, HEBREW } from "../constants/constants";
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../constants/colors'


const CommentRef = ({ book, chapter, verse, language, closeCommentTabHandler, refClick }) => {
    const classes = useStyles()

    let link
    if (language === HEBREW) {
        link = `${englishBookNameToHebrew(book)} ${indoArabicToHebrew(chapter)}:${indoArabicToHebrew(verse)}`
    } else {
        link = `${book} ${chapter}:${verse}`
    }

    return (
        <Grid container className={classes.root}>
            <Grid item xs={true} className={classes.header}>
                <span lang={LANGUAGE[language]}
                    className={LANGUAGE[language] + '-biblical-ref'}
                    onClick={refClick}>{link}
                </span>
            </Grid>
            <Grid className={classes.icon}>
                <IconButton
                    aria-label="Close comments pane"
                    component="span"
                    onClick={closeCommentTabHandler}
                >
                    <HighlightOffIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>
        </Grid>
    )
}


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    header: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
    icon: {
        backgroundColor: Colors['headerBackgroundColor'],
    }
}));

export default CommentRef