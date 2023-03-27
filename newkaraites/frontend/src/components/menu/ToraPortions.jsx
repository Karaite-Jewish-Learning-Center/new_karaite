import React from 'react'
import {torahPortions} from '../../constants/constants'
import {Link} from 'react-router-dom';
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";


const TorahPortions = ({book}) => {
    const classes = useStyles()

    const MakePortions = () => {
        const keys = Object.keys(torahPortions[book])
        const parts = [0, 1, 2, 3, 4, 5, 6]
        return keys.map(name =>
            <Grid item xs={6} >
                <p className={classes.portionsName}>{name}</p>
                {parts.map(i =>
                    <Link className={classes.portionsLink} to={`/Tanakh/${book}/${torahPortions[book][name][i][i + 1][0]}/${torahPortions[book][name][i][i + 1][1]}/`}>{i + 1}</Link>
                )}
            </Grid>
        )

    }

    if (torahPortions[book] !== undefined) {
        return (
            <div className={classes.portionsTitle}>
                <div>Torah portions</div>
                <hr className={classes.hr}/>
                <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start">
                    <MakePortions/>
                </Grid>
            </div>
        )

    } else {
        return null
    }
}


const useStyles = makeStyles((theme) => ({
    portionsTitle: {
        paddingLeft: 5,
        paddingTop: 50,
        paddingBottom: 15,
        fontSize: 20,
        fontWeight: 400,
    },
    portionsName: {
        padding: 0,
        paddingTop: 5,
        margin: 0,
    },
    portions: {
        paddingLeft: 15,
        paddingRight: 15,
        fontSize: 18,
    },
    portionsLink: {
        padding: 5,
        paddingLeft: 0,
        color: 'lightgrey',
    },
    hr: {
        marginBottom: 15,
    }
}));


export default TorahPortions