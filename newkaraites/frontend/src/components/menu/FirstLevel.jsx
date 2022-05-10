import React, {useContext, useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {getFirstLevelUrl} from '../../constants/constants'
import Filler from "../general/Filler.tsx";
import {storeContext} from "../../stores/context";
import {makeStyles} from '@material-ui/core/styles'
import Colors from "../../constants/colors";


const FirstLevel = () => {
    const [classification, setClassification] = useState(null)
    const classes = useStyles()
    const store = useContext(storeContext)
    store.resetPanes()
    useEffect(() => {
        async function fetchData() {
            const response = await fetch(getFirstLevelUrl)
            if (response.ok) {
                const data = await response.json()
                setClassification(data)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }

        fetchData()
    }, [])

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
            <hr className={classes.ruler}/>
        </Grid>)

    return (
        <div className={classes.root}>
            <Grid container xl={6} lg={6} md={6} sm={6} xs={12}
                  direction="columns"
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
        // border: '1px solid red',
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
            // backgroundColor: 'red',
            height: 120,
        },
        [theme.breakpoints.up('sm')]: {
            // backgroundColor: 'yellow',
            height: 150,
        },
        [theme.breakpoints.up('md')]: {
            // backgroundColor: 'blue',
            height: 140,
        },
        [theme.breakpoints.up('lg')]: {
            // backgroundColor: 'green',
            height: 160,
        },
        [theme.breakpoints.up('xl')]: {
            // backgroundColor: 'pink',

        },


        // border: '1px solid blue',
    },

    ruler: {
        borderColor: Colors.rulerColor,
    },

}));


export default FirstLevel