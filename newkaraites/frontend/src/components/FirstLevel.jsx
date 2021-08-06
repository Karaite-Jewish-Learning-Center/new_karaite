import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import {
    getFirstLevelUrl
} from '../constants/constants'


const FistLevel = () => {
    const [classification, setClassification] = useState(null)
    const classes = container()

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(getFirstLevelUrl)
            if (response.ok) {
                const data = await response.json()
                debugger
                setClassification(data)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
        fetchData()
    }, [])

    if (classification === null) return null;

    const levels = Object.keys(classification).map(key =>
        <Grid item xs>
            <Card className={classes.card}>
                <CardContent>
                    <Link to={'/'+key+'/'}>
                        <Typography variant="h6" component="h2">{key}</Typography>
                    </Link>
                    <p></p>
                    <Typography variant="body3" component="p">{classification[key]}</Typography>
                </CardContent>
            </Card>
        </Grid>)

    return (
        <div className={classes.container}>
            <Grid container
                direction="column"
                justifyContent="center"
                alignItems="center">
                {levels}
            </Grid>
        </div>
    )
}



const container = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 100,
    },
    card: {
        maxWidth: 300,
        margin: 30,
    },

}));

export default FistLevel