import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import {Virtuoso} from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser';
import {BOOK_CHAPTERS, BOOK_DATA, karaitesBookUrl} from "../constants/constants";
import {makeBookUrl} from "../utils/utils";
import Loading from "./Loading";


export default function KaraitesBooks({book, chapter, fullBook}) {
    const classes = useStyles()
    const [chapters, setChapters] = useState()
    const [bookData, setBookData] = useState()

    const style = {top: 100, height: 300}

    const itemContent = (item, data) => {
        debugger
        return <>
            {ReactHtmlParser(data[0], {
                decodeEntities: true,
            })}
        </>
    }

    const getKaraitesBook = async () => {
        const response = await fetch(makeBookUrl(karaitesBookUrl, book, chapter, fullBook))
        if (response.ok) {
            const data = await response.json()
            setChapters(data[BOOK_CHAPTERS])
            setBookData(data[BOOK_DATA])
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }


    useEffect(() => {
        getKaraitesBook()
    }, [])

    return (
        <div className={classes.root}>
            <Virtuoso data={chapters}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading style={classes.loading}/>
                          }
                      }}
                      style={style}/>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
        root: {
            width: '100%',
            maxWidth: '100%',
            margin: 20,
            backgroundColor: theme.palette.background.paper,
            top: 70,
            height: '85vh',
        },

    }
))

