import React from 'react'
import Grid from '@material-ui/core/Grid'
import {range} from '../../utils/utils'
import {makeStyles} from '@material-ui/core/styles'
import {Link} from 'react-router-dom'
import {Typography} from '@material-ui/core'
import {unslug} from '../../utils/utils'
import TorahPortions from "./ToraPortions";


const ChapterMenu = ({bibleBook, numberOfChapters, level}) => {
    const chapters = range(numberOfChapters)
    const classes = useStyles()

    const createMenu = () => {
        return chapters.map(chapter =>
            <Grid item xs={1} className={classes.item} key={chapter}>
                <Link className={classes.link} to={`/${level}/${bibleBook}/${chapter}/`}>
                    {chapter}
                </Link>
            </Grid>
        )
    }

    return (
        <div className={classes.container}>
            <Typography variant="h4" component="h1" className={classes.title}>{unslug(bibleBook)}</Typography>
            <Typography variant="h6" component="h1" className={classes.subtitle}>
                <Link to={`/${level}/`}>{level}</Link>
            </Typography>
            <hr/>
            <Typography variant="h5" component="h1" className={classes.chapters}>Chapters</Typography>
            <Grid container
                  spacing={1}
                  justifycontent="center"
                  alignItems="center"
            >
                {createMenu()}

            </Grid>
            <TorahPortions book={bibleBook}/>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        width: '50%',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: 'auto',
        marginTop: 50,
    },
    item: {
        width: 50,
        height: 50,
        margin: 2,
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
    },
    title: {
        marginTop: 100,
        marginBottom: 15,

    },
    filler: {
        marginTop: 100,
        marginBottom: 30,

    },
    subtitle: {
        marginBottom: 25,

    },
    chapters: {
        marginBottom: 15,
    },
}));

export default ChapterMenu