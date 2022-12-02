import React from 'react'
import {Link} from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import {slug} from '../../utils/utils'
import Filler from '../general/Filler.tsx'
import {makeStyles} from "@material-ui/core/styles"
import {languageDirection} from "../../utils/languageDirection"
import {ToText} from "../general/ToText";


const RenderMenu = ({books, path, languages = ['en', 'en'], columns = 6}) => {
    const classes = useStyles()
    const populate = (obj) => {
        // links to books
        return Object.keys(obj).map((key, index) =>
            <Grid item xs={columns} key={index}>
                <div className={classes.card}>
                    <Link to={`/${path}/${slug(key)}/`}>
                        <Typography className={classes.text} variant="h6" component="h2">{key}</Typography>
                    </Link>
                    <br/>
                    <Typography className={classes.text} style={{direction: languageDirection(languages[1])}} variant="body2" component="p">{obj[key]}</Typography>
                </div>
                <br/>
                <hr/>
            </Grid>)
    }

    const MakeMenu = () => {
        // main text menu Torah...
        return Object.keys(books).map((key, index) =>
            <Grid item xs={12} sm={columns} key={index}>
                <Grid item className={classes.title}>
                    <Typography className={classes.titleHalakhah} variant="h6" component="h2">{key}</Typography>
                    <ToText/>
                    <hr/>
                </Grid>
                <Grid container spacing={2}>
                    {populate(books[key])}
                </Grid>
            </Grid>)
    }

    return (
        <div className={classes.container}>
            <Grid container
                  direction="column"
                  justifycontent="space-evenly"
                  alignItems="center"
            >
                <Filler/>
                <MakeMenu/>
            </Grid>

        </div>
    )

}
const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
    },
    title: {
        marginTop: 50,
    },

    link: {
        marginBottom: 20,
    },
    titleHalakhah: {
        marginBottom: 20,
        paddingRight: 10,
        paddingLeft: 10,
    },
    text: {
        paddingLeft: 20,
        paddingRight: 20,
    },
    card: {
        width: '100%',
        height: 100,
        marginTop: 40,
        [theme.breakpoints.down('xl')]: {
            //backgroundColor: 'pink',
            marginBottom: 10,
            fontsize: 40,
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
            marginBottom: 130,
        },
    },
}));

export default RenderMenu