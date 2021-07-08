import React from 'react'
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';


export default function HebrewText(props) {
    const classes = useStyles()
    const {style, children} = props

    return (
        <div >
            <Typography className={{...classes.hebrewFont, ...style}}>{children}</Typography>
        </div>
    )
}


const useStyles = makeStyles(() => ({
    hebrewFont: {
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
    },
}))
