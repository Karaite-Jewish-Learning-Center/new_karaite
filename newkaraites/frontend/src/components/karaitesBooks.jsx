import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import { makeRandomKey } from "../utils/utils"
import KaraitePaneHeader from "./KaraitePaneHeader";
import { karaitesBookUrl } from '../constants/constants'
import store
    from '../stores/appState'
import Loading from "./Loading";
import './css/comments.css'
import { observer } from 'mobx-react-lite'


const PARAGRAPHS = 0
const BOOKS_DETAILS = 1



const KaraitesBooks = ({ paneNumber, refClick }) => {
    const [paragraphs, setParagraphs] = useState([])
    const [bookEnded, setBookEnded] = useState(false)
    const classes = useStyles()


    async function fetchData() {
        if (!bookEnded) {
            const response = await fetch(`${karaitesBookUrl}${store.getBook(paneNumber)}/${store.getChapter(paneNumber)}/${store.getChapter(paneNumber)}/`)
            if (response.ok) {
                const data = await response.json()
                debugger
                setBookEnded(() => data[PARAGRAPHS][0].length === 0)
                setParagraphs([...paragraphs, ...data[PARAGRAPHS][0]])
                store.setChapter(data[PARAGRAPHS][1], paneNumber)
                store.setBookDetails(data[BOOKS_DETAILS], paneNumber)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }

    }

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
        console.log('data', data[2][0].length, typeof (data[2][0]))
        return (<div className={classes.paragraphContainer}>
            {ReactHtmlParser((data[2][0].length === 0 ? "<div>&nbsp;</div>" : data[2][0]), {
                decodeEntities: true,
                transform: transform
            })}
        </div>)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <>
            <KaraitePaneHeader paneNumber={paneNumber} />
            <Virtuoso data={paragraphs}
                itemContent={itemContent}
                endReached={fetchData}
                components={{
                    Footer: () => {
                        return <Loading text={'Book end.'} />
                    }
                }}
            />
        </>
    )
}


const useStyles = makeStyles(() => ({
    virtuoso: {
        top: 70,
        position: 'fixed',
        width: '100%',
        height: '100%',
    },
    paragraphContainer: {
        marginRight: 30,
        marginLeft: 30,
    },

}))


export default observer(KaraitesBooks)