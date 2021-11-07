import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {q640} from "../../constants/constants";


export const NotFound404 =()=>{
    const classes = useStyles()
     const matches = useMediaQuery(q640)
    return (
        <div className={classes.container}>
            <div className={classes.center}>
                <p className={(matches ? classes.fontLarge: classes.fontSmall)}>Error 404 page not found!</p>
            </div>
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

