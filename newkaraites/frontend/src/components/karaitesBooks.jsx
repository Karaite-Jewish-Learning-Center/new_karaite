import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import {BOOK_CHAPTERS, BOOK_DATA, karaitesBookUrl} from "../constants/constants"
import {makeBookUrl} from "../utils/utils"
import commStyles from "../constants/common-css"
import Loading from "./Loading"


export default function KaraitesBooks({book, chapter, fullBook}) {
    const classes = useStyles()
    const [chapters, setChapters] = useState()
    const [bookData, setBookData] = useState()

    const itemContent = (item, data) => {
        return (<div className={classes.paragraphContainer}>
            {ReactHtmlParser(data[0], {
                decodeEntities: true,
            })}
        </div>)
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
        <div className={classes.virtuoso}>
            <Virtuoso data={chapters}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading text={(fullBook ? 'Book end.' : null)}/>
                          }
                      }}
            />
        </div>
    )
}


const useStyles = makeStyles(() => ({
    virtuoso: {
        width: '100%',
        height: '100%',
        position:'',
    },
    paragraphContainer: {
        marginRight: 30,
    },

}))
