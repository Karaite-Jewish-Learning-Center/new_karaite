import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Virtuoso} from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser';
import axios from 'axios'
import {karaitesBookUrl} from "../constants";
import Loading from "./Loading";


export default function KaraitesBooks({book}) {
    const classes = useStyles()
    const [error, setError] = useState(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [chapterNumber, setChapterNumber] = useState(18)
    const [bookChapters, setBookChapters] = useState(new Array(18).fill(null))
    const [bookDetails, setBookDetails] = useState([])

    const [data, setData] = useState(() => generateItems(100))
    const style = {top: 100, height: 300}
   // const itemContent = (index) => <div>Item {index}</div>

    const itemContent = (item) => {
        debugger
        return <>
            {ReactHtmlParser(bookChapters[item]['chapter_text'], {
                decodeEntities: true,
            })}
        </>
    }

    function generateItems(length) {
        return Array.from({length}, (_, index) => `My Item ${index}`)
    }

    useEffect(() => {
        axios.get(karaitesBookUrl + `${book}/${chapterNumber}/`)
            .then((response) => {
                let bc = bookChapters
                bc[chapterNumber] = response.data.book_chapter
                setBookDetails(response.data.book_details);
                setBookChapters(bc)
                setIsLoaded(true);
            })
            .catch(error => {
                setError(error)
                console.log(`Error on ${karaitesBookUrl}: ${error.response}`)
            })
    }, [book, chapterNumber])

    if (!isLoaded) return <Loading/>

    return (
        <div>
            <div className={classes.root}>

                {/*<Virtuoso data={[bookChapters]} firstItemIndex={chapterNumber} itemContent={itemContent} style={style}/>*/}
                <Virtuoso data={generateItems(100)} firstItemIndex={chapterNumber} itemContent={itemContent} style={style}/>

            </div>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%',
            maxWidth: 600,
            backgroundColor: theme.palette.background.paper,
            top: 100
        },

    }
))

