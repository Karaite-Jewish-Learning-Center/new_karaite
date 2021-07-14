import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import {BOOK_CHAPTERS, BOOK_DATA, karaitesBookUrl} from "../constants/constants"
import {makeBookUrl, makeRandomKey} from "../utils/utils"
import ReactTooltip from 'react-tooltip';
import Loading from "./Loading"
import PaneHeader from "./PaneHeader";


export default function KaraitesBooks({book, chapter, fullBook, refClick}) {
    const classes = useStyles()
    const [chapters, setChapters] = useState()
    const [bookData, setBookData] = useState()


    const transform = (node) => {
        if (node.type === 'tag') {
            // rewrite the span with a onClick event handler
            if (node.name === 'span') {
                if (node['attribs']['class'] === 'en-biblical-ref') {
                    return <span key={makeRandomKey()} lang="EN" onClick={refClick} className="en-biblical-ref">{node['children'][0]['data']}</span>
                }
                if (node['attribs']['class'] === 'he-biblical-ref') {
                    return <span key={makeRandomKey()} lang="HE" onClick={refClick} className="he-biblical-ref">{node['children'][0]['data']}</span>
                }
            }
        }
    }
    const itemContent = (item, data) => {
        return (<div className={classes.paragraphContainer}>
            {ReactHtmlParser(data[0], {
                decodeEntities: true,
                transform: transform
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
        ReactTooltip.rebuild()
    }, [])

    return (
        <div className={classes.virtuoso}>

            <PaneHeader book={book} chapter={chapter}/>
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
        position: '',
    },
    paragraphContainer: {
        marginRight: 30,
    },

}))
