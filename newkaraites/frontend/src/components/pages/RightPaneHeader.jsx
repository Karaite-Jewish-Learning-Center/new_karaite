import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import CloseIcon from '@material-ui/icons/Close';


const Header = ({ backButton, onClose }) => {
    const classes = useStyles()

    return (
        <Grid container
            direction="row"
            justifycontent="flex-end"
            alignItems="center"
            className={classes.header}>

            <Grid item xs={10}>
                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>

            <Grid item className={classes.icon}>
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
        </Grid>
    )

}

export default Header


const useStyles = makeStyles((theme) => ({
    icon:{},
    iconGrid:{},
    header: {
        minHeight: 50,
    },
}));