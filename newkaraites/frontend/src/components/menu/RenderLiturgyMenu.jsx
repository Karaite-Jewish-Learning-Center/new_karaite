import React, {useState, useEffect} from 'react'
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Filler from "../general/Filler.tsx";
import {makeStyles} from "@material-ui/core/styles";
import {capitalize, makeRandomKey} from "../../utils/utils";
import {ToText} from "../general/ToText";
import liturgyMenuItems from "./LiturgyItems";
import ArrowButton from "./ArrowButton";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import IconButton from '@material-ui/core/IconButton';


export const RenderLiturgyMenu = ({books, path, columns = 6, header = true}) => {
    const [open, setOpen] = useState(Array.from({length: books.length}, i => i = false));
    const classes = useStyles()

    const onClickArrow = key => {
        //  change hide show class for element  id=key
        setOpen({...open, [key]: !open[key]})
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
                    <Grid item xs={12} key={makeRandomKey()}>
                        <ArrowButton direction={open[key]} onClick={() => onClickArrow(key)} saying={capitalize(separator)} style={classes.title}/>
                        <div className={(open[key] ? classes.show : classes.hide)}>
                            {liturgyMenuItems(obj, classes, path, separator)}
                        </div>
                        <hr className={classes.hr}/>
                    </Grid>
                )
            }

        })
        return comp
    }
    const closeAll = () => {
        setOpen(Array.from({length: books.length}, i => i = false))
    }
    const openAll = () => {
        setOpen(Array.from({length: books.length}, i => i = true))
    }
    const CloseOpenALl = () => {
        return (
            <div className={classes.closeOpenAll}>
                <IconButton  aria-label="open all" onClick={openAll}>
                    <ArrowDropDownIcon/>
                </IconButton>
                <IconButton  aria-label="close all" onClick={closeAll}>
                    <ArrowDropUpIcon/>
                </IconButton>
            </div>
        )
    }

    const LiturgyMenu = () => {
        return (
            <Grid item xs={6} sm={columns}>
                <Grid item>
                    <Typography className={classes.title} variant="h6" component="h2">{capitalize(path)}</Typography>
                    <Grid item>
                        <ToText/>
                        <CloseOpenALl/>
                    </Grid>
                    <hr className={classes.hr}/>
                </Grid>

                <Grid container spacing={2}>
                    {classification(books)}
                </Grid>
            </Grid>)
    }

    return (
        <div>
            <div className={classes.container}>
                <Grid container
                      spacing={2}
                      direction="column"
                      justifycontent="space-evenly"
                      alignItems="center"
                >
                    <Filler xs={12}/>
                    <LiturgyMenu/>
                </Grid>
            </div>

        </div>
    )

}

const useStyles = makeStyles((theme) => ({
    container: {
        margin: 'auto',
        maxWidth: 1100,
        width: '100%',
        height: '100%',
        fontSize: 18,
        fontFamily: 'SBL Hebrew',
    },
    title: {
        marginLeft: 10,
        minHeight: 50,
    },
    bookTitle: {
        marginLeft: 30,
        fontSize: 18,
    },
    hide: {
        display: 'none',
    },
    show: {
        display: 'block',
    },
    hr: {
        padding: 0,
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
    closeOpenAll: {
        display: 'flex',
        justifyContent: 'flex-end',
    }
}));
