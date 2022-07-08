import React from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler.tsx";
import {makeStyles} from "@material-ui/core/styles";
import {capitalize} from "../../utils/utils";
import {ToText} from "../general/ToText";
import {cleanUrl} from "../../utils/cleanUrl";
import {MusicBadge} from "../bages/musicBadge";


export const RenderBooksMenu = ({books, path, columns = 6, header = true}) => {

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
                comp.push(<Grid item xs={12}>
                    <hr className={classes.hr}/>
                    <Typography variant="h6" className={classes.title}>
                        {capitalize(separator)}
                    </Typography>
                </Grid>)
            }
            comp.push(<Link to={`/${capitalize(path)}/${cleanUrl(obj[key].book_title_en)}/1/`}>
                <div className={classes.item}>
                    <span className={classes.left}>
                        <Typography className={classes.bookTitleHe}>{obj[key].book_title_he}</Typography>
                    </span>
                    <span className={classes.note}>
                         <MusicBadge length={obj[key].songs_list.length}/>
                    </span>
                    <span className={classes.right}>
                        <Typography className={classes.bookTitleEn}>
                            {obj[key].book_title_en}
                        </Typography>
                    </span>
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
            </Grid>
            <ToText/>
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
        width: 'auto',
        height: '100%',
        fontSize: 18,
        fontFamily: 'SBL Hebrew',
    },
    title: {
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
    },
    bookTitle: {
        marginLeft: 30,
        fontSize: 18,
    },
    hr: {
        marginTop: 30,
        marginBottom: 30,
        marginLeft: 20,
        marginRight: 20,
    },
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
        width:'50%',
        paddingLeft: 20,
        margin: 5,
         justifyItems: 'right',
    },
    right: {
        width:'50%',
        paddingRight: 20,
        margin: 5,
        justifyItems: 'left',
    },
    item:{
      display: 'flex',
    },
    note:{
      marginLeft:20,
      marginRight:20,
      minWidth:20,
    }
}));
