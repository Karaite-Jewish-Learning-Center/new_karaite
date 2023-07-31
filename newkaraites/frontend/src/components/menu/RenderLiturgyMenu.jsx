import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler.tsx";
import {makeStyles} from "@material-ui/core/styles";
import {capitalize, makeRandomKey, slug} from "../../utils/utils";
import {ToText} from "../general/ToText";


export const RenderLiturgyMenu = ({books, path, columns = 6, header = true}) => {

    const classes = useStyles()

    const populate = (obj) => {
        const keys = Object.keys(obj)
        let separator = ''
        let comp = []

        keys.forEach(key => {
            if (obj[key].book_classification !== separator) {

                if (header) {
                    separator = obj[key].book_classification;
                } else {
                    separator = ''
                }
                comp.push(
                    <Grid item xs={6} key={makeRandomKey()}>
                        <Link to={slug(separator) + '/'}>
                            <Typography variant="h6" className={classes.title}>
                                {capitalize(separator)}
                            </Typography>
                        </Link>
                        <hr className={classes.hr}/>
                    </Grid>
                )
            }

        })
        return comp
    }


    const LiturgyMenu = () => {
        return (<Grid item xs={12} sm={columns} key={makeRandomKey()}>

            <Grid item className={classes.title}>
                <Typography className={classes.subtitle} variant="h6" component="h2">{capitalize(path)}</Typography>
            </Grid>
            <ToText/>
            <hr/>
            <Grid container spacing={2}>
                {populate(books)}
            </Grid>
        </Grid>)
    }

    return (<div className={classes.container}>
        <Grid container
              direction="column"
              justifycontent="space-evenly"
              alignItems="center">
            <Filler xs={12}/>
            <LiturgyMenu/>
        </Grid>
    </div>)

}

const useStyles = makeStyles((theme) => ({
    container: {
        width: 'auto',
        height: '100%',
        fontSize: 18,
        fontFamily: 'SBL Hebrew',
    },
    title: {
        marginTop: 40,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 30,
        minHeight: 70,
    },
    bookTitle: {
        marginLeft: 30,
        fontSize: 18,
    },
    hr: {},
    bodyText: {
        fontSize: '14pt',
    },
    subtitle: {
        marginBottom: 20,
        color: 'gray',
    },
    bookTitleEn: {
        textAlign: 'left',
    },
    bookTitleHe: {
        textAlign: 'right',
    },
    left: {
        width: '50%',
        paddingLeft: 20,
        margin: 5,
        justifyItems: 'right',
    },
    right: {
        width: '50%',
        paddingRight: 20,
        margin: 5,
        justifyItems: 'left',
    },
    item: {
        display: 'flex',
    },
    note: {
        marginLeft: 20,
        marginRight: 20,
        minWidth: 20,
    }
}));
