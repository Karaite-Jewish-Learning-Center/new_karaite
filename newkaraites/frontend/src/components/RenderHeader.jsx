import React from 'react'
import Colors from '../constants/colors';
import { Typography } from '@material-ui/core';
import { englishBookNameToHebrew } from '../utils/utils'
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'



const RenderHeader = ({ book, chapterViewPort }) => {
    console.log("rendering RenderHeader")
    const classes = useStyles()
    return (
        <Grid container className={classes.header}
            direction="row"
            justifycontent="center"
            alignItems="center"
        >
            <Grid item xs={4} key={1}>
                <Typography className={classes.hebrewBook}>{englishBookNameToHebrew(book)}</Typography>
            </Grid>
            <Grid item xs={4} key={2}>
                <Typography className={classes.chapterView}>{chapterViewPort} </Typography>
            </Grid>
            <Grid item xs={4} key={3}>
                <Typography className={classes.englishBook}>{book} </Typography>
            </Grid>
        </Grid>
    )
}


const useStyles = makeStyles((theme) => ({
    header: {
        flexGrow: 1,
        minHeight: 50,
        maxHeight: 50,
        width: '100%',
        backgroundColor: Colors['headerBackgroundColor'],
        textAlign: 'center'
    },
    hebrewBook: {
        textAlign: 'right',
        verticalAlign: 'middle',
    },
    chapterView: {
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingRight: 30,
    },
    englishBook: {
        verticalAlign: 'middle',
        textAlign: 'left',
    },
}));

export default RenderHeader