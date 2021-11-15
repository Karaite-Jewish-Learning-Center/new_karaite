import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {getFirstLevelUrl} from '../constants/constants'
import {booksMenu} from '../constants/common-css'
import Filler from "./Filler";


const FirstLevel = () => {
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
                <Link to={'/' + key + '/'}>
                    <Typography variant="h6" component="h2">{key}</Typography>
                </Link>
                <br/>
                <Typography variante="body3" component="p">{classification[key]}</Typography>
                <hr/>
            </div>
        </Grid>)

    return (
        <div className={classes.container}>
            <Grid container
                  direction="column"
                  justifyContent="center"
                  alignItems="center">
                <Filler/>
                {levels}
            </Grid>
        </div>
    )
}


export default FirstLevel