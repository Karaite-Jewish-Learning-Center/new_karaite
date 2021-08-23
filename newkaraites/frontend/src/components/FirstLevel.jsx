import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { getFirstLevelUrl } from '../constants/constants'
import { booksMenu } from '../constants/common-css'


const FistLevel = () => {
    const [classification, setClassification] = useState(null)
    const classes = booksMenu()

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
        <Grid item xs key={key}>
            <div className={classes.card}>
                <Link to={'/' + key + '/'} >
                    <Typography variant="h6" component="h2">{key}</Typography>
                </Link>
                <br />
                <Typography component="p">{classification[key]}</Typography>
                <hr />
            </div>
        </Grid>)

    return (
        <div className={classes.container}>
            <div className={classes.filler}>&nbsp;</div>
            <Grid container
                direction="column"
                justifycontent="center"
                alignItems="center">
                {levels}
            </Grid>
        </div>
    )
}


export default FistLevel