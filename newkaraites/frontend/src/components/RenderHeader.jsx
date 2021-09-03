import React from 'react'
import Colors from '../constants/colors';
import { Typography } from '@material-ui/core';
import { englishBookNameToHebrew } from '../utils/utils'
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close';
import store from '../stores/appState';
import { observer } from 'mobx-react-lite';



const RenderHeader = ({ book, chapterViewPort, paneNumber }) => {
    console.log("rendering RenderHeader")
    const classes = useStyles()

    const onClose = () => {
        store.closePane(paneNumber)
    }

    return (
        <Grid container className={classes.header}
            direction="row"

        >
            <Grid item xs={1} key={0}>
                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.iconGrid} />
                </IconButton>

            </Grid>
            <Grid item xs={3} key={1}>

                <Typography className={classes.hebrewBook}>{englishBookNameToHebrew(book)}</Typography>
            </Grid>
            <Grid item xs={4} key={2}>
                <Typography className={classes.chapterView}>{chapterViewPort} </Typography>
            </Grid>
            <Grid item xs={4} key={3}>
                <Typography className={classes.englishBook}>{book} </Typography>
            </Grid>
        </Grid>
    )
}


const useStyles = makeStyles((theme) => ({
    header: {
        flexGrow: 1,
        minHeight: 50,
        maxHeight: 50,
        width: '100%',
        backgroundColor: Colors['rightPaneBackGround'],
        textAlign: 'center'
    },
    hebrewBook: {
        textAlign: 'right',
        verticalAlign: 'middle',
    },
    chapterView: {
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingRight: 23,
    },
    englishBook: {
        verticalAlign: 'middle',
        textAlign: 'left',
    },
}));

export default observer(RenderHeader)