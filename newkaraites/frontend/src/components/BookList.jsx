import {useState, useEffect} from 'react';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import bookListUrl from "../constants";

const useStyles = makeStyles({
    root: {
        display:"flex",
        maxWidth:200,
        height:50,
        margin:20,
        alignItems:"center",
        justifyContent:"center",
    },

});

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
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                {books.map(book => (
                    <Card className={classes.root} key={book.id}>
                        <Typography variant="h5" component="h2">
                            {book.book_title_en}
                        </Typography>
                    </Card>
                ))}
            </div>
        );
    }
}