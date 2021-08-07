import React from 'react'
import Grid from '@material-ui/core/Grid'
import { chaptersByBibleBook } from '../constants/constants'
import { range } from '../utils/utils'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../constants/colors'
import { Link } from 'react-router-dom'



const ChapterMenu = ({ bibleBook }) => {
    const numberOfChapters = chaptersByBibleBook[bibleBook]
    const columns = 10
    const chapters = range(numberOfChapters)
    const classes = container()

    const createMenu = () => {
        return chapters.map(chapter =>
            <Grid item className={classes.item}>
                <Link to={`/${bibleBook}/${chapter}/`} >
                    <span>{chapter}</span>
                </Link>
            </Grid>
        )
    }

    return (
        <div className={classes.container}>
            <div className={classes.filler}>&nbsp;</div>
            <Grid container xs={columns}
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
        // display: 'block',
        // height: '100%',
        // width: '100%',
        // verticalAlign: 'middle',
        // fontSize: 18,
        // fontWeight: 'lighter',
        // textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',

    },
    title: {
        marginBottom: 50,
        color: 'gray',
    },
    ruler: {
        borderColor: Colors.rulerColor,
    },
    filler: {
        marginTop: 70,
    }
}));

export default ChapterMenu