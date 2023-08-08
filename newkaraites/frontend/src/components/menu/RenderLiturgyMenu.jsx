import React, {useState, useEffect} from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {Link} from "react-router-dom";
import Filler from "../general/Filler.tsx";
import {makeStyles} from "@material-ui/core/styles";
import {capitalize, makeRandomKey} from "../../utils/utils";
import {ToText} from "../general/ToText";
import liturgyMenuItems from "./LiturgyItems";
import ArrowButton from "./ArrowButton";


export const RenderLiturgyMenu = ({books, path, columns = 6, header = true}) => {
    const [visible, setVisible] = React.useState(true);
    const [classifications, setClassifications] = useState([]);
    const [open, setOpen] = useState(Array.from({length: books.length}, i => i = false));

    const classes = useStyles()
    const onLinkClick = (e) => {
        e.preventDefault()
        setClassifications(e.target.firstChild)
        setVisible(!visible)
    }

    const onClickArrow = key => {
        let tmp = {...open}
        tmp[key] = !tmp[key]
        setOpen(tmp)

    }

    const ToTextLocal = () => {
        return (
            <div>
                <Link to={''} onClick={onLinkClick} className={classes.textLocal}>
                    {'\u2190'}{' '}To Text
                </Link>
            </div>
        )
    }
    const classification = (obj) => {
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
                        <ArrowButton direction={open[key]} onClick={() => onClickArrow(key)} saying={capitalize(separator)} style={classes.title}/>
                        <hr className={classes.hr}/>
                    </Grid>
                )
            }

        })
        return comp
    }

    const liturgyItems = (obj) => {
        return liturgyMenuItems(obj, classes, path, classifications)
    }

    const LiturgyMenu = () => {
        return (<Grid item xs={6} sm={columns} key={makeRandomKey()}>
            <Grid item className={classes.title}>
                <Typography className={classes.title} variant="h6" component="h2">{capitalize(path)}</Typography>
                <ToText/>
                <hr className={classes.hr}/>
            </Grid>

            <Grid container spacing={2}>
                {classification(books)}
            </Grid>
        </Grid>)
    }

    return (
        <div>
            {visible && <div className={classes.container}>
                <Grid container
                      direction="column"
                      justifycontent="space-evenly"
                      alignItems="center"
                >
                    <Filler xs={12}/>
                    <LiturgyMenu/>
                </Grid>
            </div>}

            {!visible && <div className={classes.container}>
                <Grid container
                      spacing={2}
                      direction="column"
                      justifycontent="space-evenly"
                      alignItems="center"
                >
                    <Grid item xs={6} sm={columns}>
                        <div className={classes.container}>
                            <Filler xs={12}/>
                            <Typography className={classes.subtitle} variant="h6" component="h2">{classifications.data}</Typography>
                            <ToTextLocal onClick={onLinkClick}/>
                            <hr className={classes.hr}/>
                            {liturgyItems(books)}
                        </div>
                    </Grid>
                </Grid>
            </div>
            }
        </div>
    )

}

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        fontSize: 18,
        fontFamily: 'SBL Hebrew',
    },
    title: {
        marginLeft: 10,
        minHeight: 70,
    },
    bookTitle: {
        marginLeft: 30,
        fontSize: 18,
    },
    hr: {
        width: 'auto',
    },
    bodyText: {
        fontSize: '14pt',
    },
    subtitle: {
        minWidth: 600,
        marginTop: 20,
        marginBottom: 20,
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
        width: '100%',
        display: 'flex',
    },
    note: {
        marginLeft: 20,
        marginRight: 20,
        minWidth: 20,
    },
    textLocal: {
        minHeight: 30,
        marginBottom: 10,
        fontSize: 20,
        paddingLeft: 20,
    }

}));
