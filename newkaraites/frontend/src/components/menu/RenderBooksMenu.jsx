import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler.tsx";
import {makeStyles} from "@material-ui/core/styles";
import Colors from "../../constants/colors";
import {capitalize} from "../../utils/utils";
import {ToText} from "../general/ToText";
import {cleanUrl} from "../../utils/cleanUrl";


export const RenderBooksMenu = ({books, path, languages = ['en', 'en'], columns = 6, header = true}) => {

    const classes = useStyles()

    const populate = (obj) => {
        debugger
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
                comp.push(<Grid item xs={12}>
                    <hr className={classes.hr}/>
                    <Typography variant="h6" className={classes.title}>
                        {capitalize(separator)}
                    </Typography>
                </Grid>)
            }
            comp.push(<Link to={`/${capitalize(path)}/${cleanUrl(obj[key].book_title_en)}/1/`}>
                <div>
                    <div className={classes.left}>
                        <Typography className={classes.bookTitleEn}>{obj[key].book_title_en}</Typography>
                    </div>
                    <div className={classes.right}>
                        <Typography className={classes.bookTitleHe}>{obj[key].book_title_he}</Typography>
                    </div>
                </div>
            </Link>)

        })
        comp.push(<Grid item xs={12}>
            <hr className={classes.hr}/>
            <Typography variant="h6" className={classes.title}>
            </Typography>
        </Grid>)
        return comp
    }


    const MainMenu = () => {
        return (<Grid item xs={12} sm={columns} key={1}>
            <Grid item className={classes.title}>
                <Typography className={classes.subtitle} variant="h6" component="h2">{capitalize(path)}</Typography>
                <ToText/>
            </Grid>
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
            <MainMenu/>
            <Filler xs={12}/>
        </Grid>
    </div>)

}

const useStyles = makeStyles((theme) => ({
    container: {
        width: 'auto', height: '100%', fontSize: 18, fontFamily: 'SBL Hebrew',
    }, title: {
        marginTop: 10, marginBottom: 10,
    }, bookTitle: {
        marginLeft: 30, fontSize: 18,
    }, ruler: {
        marginTop: 30, borderColor: Colors.rulerColor,
    }, hr: {
        marginTop: 30, marginBottom: 30,
    }, bodyText: {
        fontSize: '14pt',
    }, subtitle: {
        marginBottom: 20, color: 'gray',
    }, bookTitleEn: {
        textAlign: 'left',
    }, bookTitleHe: {
        textAlign: 'right',
    },
    left: {
      float: 'left',
        margin:5,
    },
    right: {
      float: 'right',
        margin:5,
    }
}));
