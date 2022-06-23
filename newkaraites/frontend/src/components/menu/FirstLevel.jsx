import React, {useContext} from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {storeContext} from "../../stores/context";
import {referenceContext} from "../../stores/references/referenceContext";
import {makeStyles} from '@material-ui/core/styles'
import {observer} from 'mobx-react-lite';

const HEBREW = 1
const ENGLISH = 0

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
                    <span className={classes.left}>
                        <Typography className={classes.hebrew} variant="h6" component="h2">{classification[key][HEBREW]}</Typography>
                    </span>
                    <span className={classes.right}>
                         <Typography className={classes.english} variant="h6" component="h2">{classification[key][ENGLISH]}</Typography>
                    </span>
                </Link>
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
    },
    left: {
        width: '50%',
        float: 'left',
    },
    right: {
        width: '50%',
        float: 'right',
    },
    hebrew: {
        marginRight: theme.spacing(3),
        direction: 'rtl',
        textAlign: 'right',
    },
    english: {
        marginLeft: theme.spacing(3),
        direction: 'ltr',
        textAlign: 'left',
    }
}));


export default observer(FirstLevel)