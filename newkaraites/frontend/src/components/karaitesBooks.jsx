import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import KaraitePaneHeader from "./KaraitePaneHeader";
import transform from '../utils/transform'
import store from '../stores/appState'
import Loading from "./Loading";
import './css/comments.css'
import Colors from '../constants/colors'

const KaraitesBooks = ({ paneNumber, refClick, paragraphs }) => {

    const classes = useStyles()

    const itemContent = (item, data) => {
        return (<div className={`${classes.paragraphContainer} ${store.getCurrentItem(paneNumber) === item ? classes.selected : ''}`}>{item}

            {ReactHtmlParser((data[2][0].length === 0 ? "<div>&nbsp;</div>" : data[2][0]), {
                decodeEntities: true,
                transform: transform.bind(this, refClick, item, 'Bible', paneNumber)
            })}
        </div>)
    }


    return (
        <>
            <KaraitePaneHeader paneNumber={paneNumber} />
            <Virtuoso data={paragraphs}
                initialTopMostItemIndex={parseInt(store.getCurrentItem(paneNumber))}
                itemContent={itemContent}
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
        "&:hover": {
            background: Colors['bibleSelectedVerse']
        },
    },
    selected: {
        backgroundColor: Colors['rulerColor']
    }
}))


export default KaraitesBooks