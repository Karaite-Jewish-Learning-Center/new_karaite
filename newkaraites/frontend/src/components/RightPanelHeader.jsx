import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import Colors from '../constants/colors'



const RightPaneHeader = ({ close }) => {

    const classes = useStyles()

    return (
        <Grid container
            direction="row-reverse"
            justifycontent="flex-end"
            alignItems="center"
            className={classes.container}
        >

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
    }
}));