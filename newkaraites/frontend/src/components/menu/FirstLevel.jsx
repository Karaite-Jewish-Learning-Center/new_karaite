import React, {useContext} from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {storeContext} from "../../stores/context";
import {referenceContext} from "../../stores/references/referenceContext";
import {makeStyles} from '@material-ui/core/styles'
import {observer} from 'mobx-react-lite';


const FirstLevel = () => {
    const store = useContext(storeContext)
    const reference = useContext(referenceContext)
    const classification = reference.getLevelsAll()
    const classes = useStyles()

    store.resetPanes()

    if (classification === null) return null;

    const levels = Object.keys(classification).map(key =>
        <Grid item xl={6} lg={6} md={12} sm={12} xs={12} key={key}>
            <div className={classes.card}>
                <Link to={'/' + key + '/'}>
                    <Typography variant="h6" component="h2">{key}</Typography>
                </Link>
                <br/>
                <Typography
                    variante="body3" component="p">{classification[key]}
                </Typography>
            </div>
            <hr/>
        </Grid>)

    return (
        <div className={classes.root}>
            <Grid container item xl={6} lg={6} md={6} sm={6} xs={12}
                  justifycontent="center"
                  alignItems="center"
                  spacing={1}
                  className={classes.grid}
            >
                {levels}
            </Grid>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(15),
        width: '100%',
    },
    grid: {
        margin: 'auto',
        padding: theme.spacing(2),
    },
    card: {
        width: '100%',
        height: 100,
        [theme.breakpoints.up('xs')]: {
            height: 200,
        },
        [theme.breakpoints.up('sm')]: {
            height: 150,
        },
        [theme.breakpoints.up('md')]: {
            height: 140,
        },
        [theme.breakpoints.up('lg')]: {
            height: 160,
        },
        [theme.breakpoints.up('xl')]: {
        },
    },
}));


export default observer(FirstLevel)