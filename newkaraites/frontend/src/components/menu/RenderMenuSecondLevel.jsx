import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler";
import {makeStyles} from "@material-ui/core/styles";
import Colors from "../../constants/colors";
import {slug} from "../../utils/utils";
import {languageDirection} from "../../utils/languageDirection";
import ReactHtmlParser from 'react-html-parser'


const cleanUrl = (url) => {
    let result = slug(url.trim().split(',')[1])
    if (result.startsWith('-')) {
        result = result.substring(1)
    }
    return result
}

const toHtml =(html )=> ReactHtmlParser(html)

export const RenderMenuSecondLevel = ({liturgyStore, path, languages = ['en', 'en'], columns = 6}) => {

    const classes = useStyles()
    const populate = (obj) => {

        debugger
        return Object.keys(obj).map((key, index) =>
            <Grid item xs={12} key={index}>
                <div className={classes.card}>
                    <Link to={`/${path}/${cleanUrl(obj[key].book_title)}/`}>
                        <Typography variant="h6" component="h2">{obj[key].book_title}</Typography>
                    </Link>
                    <br/>
                    <Typography style={{direction:'LTR' }} variant="body2" component="p">{toHtml(obj[key].intro)}</Typography>
                    <hr className={classes.ruler}/>
                </div>

            </Grid>)
    }
    const MainMenu = () => {

        return (
            <Grid item xs={12} sm={columns} key={1}>
                <Grid item className={classes.title}>
                    <Typography className={classes.subtitle} variant="h6" component="h2">Liturgy</Typography>
                    <Link className={classes.link} to='/texts/'>To texts</Link>
                    <hr className={classes.ruler}></hr>
                </Grid>
                <Grid container spacing={2}>
                    {populate(liturgyStore)}
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
                <Filler xs={12}/>
                <MainMenu/>
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
    ruler: {
        marginTop: 30,
        borderColor: Colors.rulerColor,
    },
    link: {
        marginBottom: 20,
    },
    subtitle: {
        marginBottom: 20,
        color: 'gray',
    },
    card: {
        width: '100%',
        height: '100%',
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
            marginBottom: 80,
        },
    },
}));
