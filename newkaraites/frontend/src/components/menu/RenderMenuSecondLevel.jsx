import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler";
import {makeStyles} from "@material-ui/core/styles";
import Colors from "../../constants/colors";
import {slug} from "../../utils/utils";
import parse from 'html-react-parser'
import {capitalize} from "../../utils/utils";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {ToText} from "../general/ToText";

const cleanUrl = (url) => {
    let result = slug(url.trim().split(',')[0])
    if (result.startsWith('-')) {
        result = result.substring(1)
    }
    return result
}

const toHtml = (html) => parse(html)

export const RenderMenuSecondLevel = ({books, path, languages = ['en', 'en'], columns = 6}) => {

    const classes = useStyles()
    const populate = (obj) => {
        return Object.keys(obj).map((key, index) =>
            <Accordion className={classes.accordion}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls={`liturgy book ${cleanUrl(obj[key].book_title)}`}
                    id="obj[key].book_title"
                >
                    <Link to={`/${capitalize(path)}/${cleanUrl(obj[key].book_title)}/1/`}>
                        <Typography variant="h6" component="h2">{obj[key].book_title}</Typography>
                    </Link>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        {toHtml(obj[key].intro)}
                    </Typography>
                </AccordionDetails>
            </Accordion>
        )
    }
    const MainMenu = () => {

        return (
            <Grid item xs={12} sm={columns} key={1}>
                <Grid item className={classes.title}>
                    <Typography className={classes.subtitle} variant="h6" component="h2">{capitalize(path)}</Typography>
                    <ToText/>
                </Grid>
                <Grid container spacing={2}>
                    {populate(books)}
                </Grid>
            </Grid>)
    }
    return (
        <div className={classes.container}>
            <Grid container
                  direction="column"
                  justifycontent="space-evenly"
                  alignItems="center">
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
        fontSize: '16pt',
    },
    accordion:{
        width: '100%',
        padding: '10px',
        margin: '1px',
        borderRadius:0,
    },
    title: {
        marginTop: 50,
        marginBottom: 40,
    },
    ruler: {
        marginTop: 30,
        borderColor: Colors.rulerColor,
    },
    link: {
        marginBottom: 20,
    },
    bodyText: {
        fontSize: '14pt',
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