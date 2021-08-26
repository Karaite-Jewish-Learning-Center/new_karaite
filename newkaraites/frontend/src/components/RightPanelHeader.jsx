import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import Colors from '../constants/colors'



const RightPaneHeader = ({ back, close }) => {

    const classes = useStyles()

    console.log("Rendering Right Pane header")
    return (
        <Grid container
            direction="row"
            justifycontent="flex-end"
            alignItems="center"
            className={classes.container}
        >
            <Grid item xs={10}>
                <IconButton
                    aria-label="Back"
                    component="span"
                    onClick={back}
                >
                    <ChevronLeftIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>
            <Grid item className={classes.icon}>
                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={close}
                >
                    <HighlightOffIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>
        </Grid>
    )

}

export default RightPaneHeader


const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        width: '100%',
        top: 70,
        backgroundColor: Colors['headerBackgroundColor']
    },
    header: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
    icon: {
        backgroundColor: Colors['headerBackgroundColor'],
    },
}));