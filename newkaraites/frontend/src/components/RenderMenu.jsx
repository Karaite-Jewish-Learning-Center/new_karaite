import React from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {booksMenu} from '../constants/common-css'
import {slug} from '../utils/utils'
import Filler from '../components/Filler'
import {makeStyles} from "@material-ui/core/styles";


const RenderMenu = ({books, path}) => {
    const classes = booksMenu()
    const columns = 6
    const localClasses = local()

    const populate = (obj) => {
        return Object.keys(obj).map((key, index) =>
            <Grid item xs={columns} key={index}>
                <div className={localClasses.card}>
                    <Link to={`/${path}/${slug(key)}/`}>
                        <Typography variant="h6" component="h2">{key}</Typography>
                    </Link>
                    <br/>
                    <Typography variant="body2" component="p">{obj[key]}</Typography>
                </div>
                <hr className={classes.ruler}/>
            </Grid>)
    }
    const MakeMenu = () => {
        return Object.keys(books).map((key, index) =>
            <Grid xs={12} sm={columns} key={index}>
                <Grid item className={localClasses.title}>
                    <Typography className={classes.titleHalakhah} variant="h6" component="h2">{key}</Typography>
                    <Link className={classes.link} to='/texts/'>To texts</Link>
                    <hr className={classes.ruler}></hr>
                </Grid>
                <Grid container spacing={2}>
                    {populate(books[key])}
                </Grid>
            </Grid>)
    }
    return (
        <div className={localClasses.container}>
            <Grid container
                  direction="column"
                  justifyContent="space-evenly"
                  alignItems="center"
            >
                <Filler/>
                <MakeMenu/>
            </Grid>

        </div>
    )

}
const local = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        margin: 10,
    },
    title: {
        marginTop: 50,
    },
    card: {
        width: '100%',
        height: 100,
        marginTop: 40,
         [theme.breakpoints.down('xl')]: {
            //backgroundColor: 'pink',
            marginBottom: 10,
            fontsize:40,
        },
         [theme.breakpoints.down('lg')]: {
            //backgroundColor: 'green',
            marginBottom: 10,
        },
         [theme.breakpoints.down('md')]: {
            //backgroundColor: 'blue',
            marginBottom: 30,
        },
         [theme.breakpoints.down('sm')]: {
            //backgroundColor: 'yellow',
            marginBottom: 100,
        },
        [theme.breakpoints.down('xs')]: {
            //backgroundColor: 'red',
            marginBottom: 80,
        },


    },
}));

export default RenderMenu