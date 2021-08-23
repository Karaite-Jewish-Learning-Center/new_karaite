import React from 'react'
import Grid from '@material-ui/core/Grid'
import { range } from '../utils/utils'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../constants/colors'
import { Link } from 'react-router-dom'
import { Typography } from '@material-ui/core'
import { slug } from '../utils/utils'


const ChapterMenu = ({ bibleBook, numberOfChapters, level }) => {
    const chapters = range(numberOfChapters)
    const classes = container()


    const createMenu = () => {
        return chapters.map(chapter =>
            <Grid item xs={1} className={classes.item} key={chapter}>
                <Link className={classes.link} to={`/${slug(bibleBook)}/${chapter}/`} >
                    {chapter}
                </Link>
            </Grid>
        )
    }

    return (
        <div className={classes.container}>
            <Typography variant="h4" component="h1" className={classes.title}>{bibleBook}</Typography>
            <Typography variant="h6" component="h1" className={classes.subtitle}>{level}</Typography>
            <hr />
            <Typography variant="h5" component="h1" className={classes.chapters}>Chapters</Typography>
            <Grid container
                spacing={1}
                justifyContent="center"
                alignItems="center"
            >
                {createMenu()}
            </Grid>
        </div>
    )
}



const container = makeStyles((theme) => ({
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
        backgroundColor: Colors.chapterMenu,
        margin: 2,
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginTop: 100,
        marginBottom: 15,
        color: 'gray',
    },
    ruler: {
        borderColor: Colors.rulerColor,
    },
    filler: {
        marginTop: 100,
        marginBottom: 30,

    },
    subtitle: {
        marginBottom: 25,
        color: Colors.tanakh,
    },
    chapters: {
        marginBottom: 15,
    },
}));

export default ChapterMenu