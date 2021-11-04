import React from 'react'
import {makeStyles} from '@material-ui/core/styles'

export const SearchResult = ({search}) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <p className={classes.center}>The search result:{search}</p>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        width: '100%',
        height: '100%',
        justifyContent: 'center',
    },
    center: {
        display: 'flex',
        alignItems: 'center',
    },
    fontSmall: {
        fontSize: 25,
    },
    fontLarge: {
        fontSize: 40,
    },
}));

