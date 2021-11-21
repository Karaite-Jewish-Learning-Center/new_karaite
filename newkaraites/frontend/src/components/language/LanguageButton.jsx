import React from "react"
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from '@material-ui/core/styles'

export const LanguageButton = () => {
    const classes = useStyles()

    return <IconButton aria-label="select language" className={classes.root} variant="outlined">{'A\u2135'}</IconButton>
}

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: 48,
        minHeight: 48,
        fontFamily: "SBL Hebrew",
        fontSize: 18,
        lineHeight:0,
        padding:1,
    }
}));