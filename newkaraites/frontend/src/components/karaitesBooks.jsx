import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import KaraitePaneHeader from "./KaraitePaneHeader";
import { karaitesBookUrl } from '../constants/constants'
import transform from '../utils/transform'
import store from '../stores/appState'
import Loading from "./Loading";
import './css/comments.css'
import { observer } from 'mobx-react-lite'


const PARAGRAPHS = 0


const KaraitesBooks = ({ paneNumber, refClick }) => {
    const [paragraphs, setParagraphs] = useState([])
    const [bookEnded, setBookEnded] = useState(false)
    const [first, setFirst] = useState(0)
    const book = store.getBook(paneNumber)

    const classes = useStyles()


    async function fetchData() {
        if (!bookEnded) {
            const chapter = (paragraphs.length === 0 ? store.getChapter(paneNumber) : paragraphs.length)

            const response = await fetch(`${karaitesBookUrl}${book}/${chapter}/${first}/`)
            if (response.ok) {
                const data = await response.json()
                setBookEnded(() => data[PARAGRAPHS][0].length === 0)
                setParagraphs([...paragraphs, ...data[PARAGRAPHS][0]])
                setFirst(1)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }

    }


    const itemContent = (item, data) => {
        return (<div className={classes.paragraphContainer}>
            {ReactHtmlParser((data[2][0].length === 0 ? "<div>&nbsp;</div>" : data[2][0]), {
                decodeEntities: true,
                transform: transform.bind(this, refClick)
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