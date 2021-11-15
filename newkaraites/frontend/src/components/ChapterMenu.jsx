import React, {useContext} from 'react'
import Grid from '@material-ui/core/Grid'
import {range} from '../utils/utils'
import {makeStyles} from '@material-ui/core/styles'
import Colors from '../constants/colors'
import {Link} from 'react-router-dom'
import {Typography} from '@material-ui/core'
import {unslug} from '../utils/utils'
import {storeContext} from "../stores/context";


const ChapterMenu = ({bibleBook, numberOfChapters, level}) => {
    const store = useContext(storeContext)
    const chapters = range(numberOfChapters)
    const classes = container()
    // todo: find a better solution
    store.setIsLastPane(false)


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