import React from "react";
import {useState, useEffect} from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import {bookListUrl} from "../constants";


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginTop: theme.spacing(5),
    },
    paper: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        textAlign: "center",
        verticalAlign: "middle",
        height: 40,
        width: 150
    },
    org: {
        marginTop: theme.spacing(5)
    },
    centerDiv: {}
}))

export default function BookList() {
    const classes = useStyles();
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch(bookListUrl)
            .then(res => res.json())
            .then(
                (result) => {
                    debugger
                    setIsLoaded(true);
                    setBooks(result);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    if (error) {
        return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
        return <div>Loading...</div>
    } else {
        return (
            <div className={classes.centerDiv}>
                <Typography align="center" variant="h4" className={classes.org}>
                    Tanakh
                </Typography>
                {books.map((bookList, index) => (
                    <Grid container direction="row" justify="flex-start" alignItems="center" key={index}>
                        {bookList.map(book => (
                            <Grid item xs={3} key={book.id}>
                                <Paper className={classes.paper} elevation={3}>
                                    {book.book_title_en}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </div>
        )
    }
}


