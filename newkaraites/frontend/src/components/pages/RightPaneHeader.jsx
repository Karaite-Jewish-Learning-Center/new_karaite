import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../../constants/colors'
import { Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'


const Header = ({ backButton, onClose }) => {
    const classes = useStyles()

    return (
        <Grid container
            direction="row"
            justifycontent="flex-end"
            alignItems="center"
            className={classes.header}>

            <Grid item xs={10}>
                {(backButton !== undefined ?
                    <IconButton
                        aria-label="Back"
                        component="span"
                        onClick={backButton}
                    >
                        <ChevronLeftIcon className={classes.iconGrid} />
                    </IconButton>
                    : null)}
            </Grid>

            <Grid item className={classes.icon}>
                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={onClose}
                >
                    <HighlightOffIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>
        </Grid>
    )

}

export default Header


const useStyles = makeStyles((theme) => ({
    icon:{},
    iconGrid:{},
    header: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
}));