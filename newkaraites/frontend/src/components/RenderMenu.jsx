import React from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { booksMenu } from '../constants/common-css'
import { slug } from '../utils/utils'


const RenderMenu = ({ books, path }) => {

    const classes = booksMenu()
    const populate = (obj) => {
        return Object.keys(obj).map((key, index) =>
            <Grid item xs={6} key={index}>
                <div className={classes.card}>
                    <Link to={`/${path}/${slug(key)}/`}>
                        <Typography variant="h6" component="h2">{key}</Typography>
                    </Link>
                    <br />
                    <Typography variant="body2" component="p">{obj[key]}</Typography>
                </div>
                <hr className={classes.ruler} />
            </Grid>)
    }
    const makeMenu = () => {
        return Object.keys(books).map((key, index) =>
            <div className={classes.container} key={index}>
                <Typography className={classes.title} variant="h6" component="h2">{key}</Typography>
                <hr className={classes.ruler}></hr>
                <Grid container spacing={1}
                    direction="row"
                    alignItems="center">
                    {populate(books[key])}
                </Grid>
            </div>)
    }
    return makeMenu()
}

export default RenderMenu