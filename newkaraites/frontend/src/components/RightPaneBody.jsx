import React from 'react'
import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MenuBookIcon from '@material-ui/icons/MenuBook';
import Colors from '../constants/colors'

const COMMENTS = 0
const REFS = 1

const items = ['Commentary', 'Halakhah']


const RightPaneBody = ({ rightPaneNumbers }) => {
    const classes = useStyles()

    const Item = () => {
        return items.map(item => {
            return (
                <>
                    <Grid item alignItems="center">
                        <MenuBookIcon className={classes.icon} />
                        <Typography className={classes.text}>
                            {item} ({rightPaneNumbers[COMMENTS]})
                        </Typography>
                    </Grid>
                </>
            )
        })
    }

    return (
        <div className={classes.container}>
            <Typography className={classes.headerColor}>Related text</Typography>
            <hr className={classes.ruler} />
            <Grid container
                spacing={1}
                alignItems='start'
                direction='column'>

                <Item />
            </Grid>
        </div>
    )
}



const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: 40,
        marginLeft: 30,
        marginRight: 30,
    },
    ruler: {
        borderColor: Colors.rulerColor,
    },
    headerColor: {
        color: Colors.leftPaneHeader,
    },
    icon: {
        color: Colors.leftPaneHeader,
        fontSize: 20,
        marginTop: 6,
    },
    text: {
        fontSize: 14,
    },
}));

export default RightPaneBody