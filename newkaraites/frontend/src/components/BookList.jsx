import React, {useReducer} from "react";
import Box from '@material-ui/core/Box';
import {useState, useEffect} from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import {bookListUrl} from "../constants";


const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(15),
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    container: {
        width: '100%',
        height: '100%',
    },
    paper: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        fontSize: 18,
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
const FIRSTLEVEL = 0
const SECONDLEVEL = 1
const BOOKNAME = 2

export default function BookList() {
    const classes = useStyles();
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [books, setBooks] = useState([]);
    // const [firstLevel, setFirstLevel] = useState('Tanakh')
    //const [secondLevel, setSecondLevel] = useState('Torah')


    const BookHeaderFirst = ({i}) => {
        if (i === 0) return <h1>{books[i][FIRSTLEVEL]}</h1>
        return null
    }
    const BookHeaderSecond = ({i}) => {
        if (i === 0) return <h2>{books[i][SECONDLEVEL]}</h2>

        return null
    }
    const BookName = ({i}) => {
        return <div>{books[i][BOOKNAME]}</div>
    }

    useEffect(() => {
        fetch(bookListUrl)
            .then(res => res.json())
            .then(
                (result) => {
                    debugger

                    setBooks(result);
                    setIsLoaded(true);
                    debugger
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
            <div className={classes.root}>
                {books.map((book, index) => (
                    <div>
                        <BookHeaderFirst i={index}/>
                        <BookHeaderSecond i={index}/>
                        <BookName i={index}/>
                    </div>
                ))}
            </div>
        )
    }
}

//
//
//  <Typography align="center" variant="h4" className={classes.org}>
// Tanakh
// </Typography>
//
//
//     {
//        books.map((bookList, index) => (
//                    <Box display="flex" justifyContent="center" flexDirection="row" p={1} key={index}>
//                         {bookList.map(book => (
//                             <Box p={2} m={1}>
//                                 <Paper className={classes.paper}>
//                                     {book.book_title_en}
//                                 </Paper>
//                             </Box>
//
//                         ))}
//                     </Box>
//                 ))}