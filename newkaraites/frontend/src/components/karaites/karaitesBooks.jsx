import React, {useContext} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Virtuoso } from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import KaraitePaneHeader from "./KaraitePaneHeader";
import transform from '../../utils/transform'
import Loading from "../general/Loading";
import '../../css/_comments.css'
import Colors from '../../constants/colors'
import {storeContext} from "../../stores/context";




const KaraitesBooks = ({ paneNumber, refClick, paragraphs }) => {
    const store = useContext(storeContext)
    const classes = useStyles()

    const selectCurrent = (item) => {
        if (store.panes.length === 1) {
            return false
        }
        return store.getCurrentItem(paneNumber) === item

    }
    const itemContent = (item, data) => {
        return (<div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
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
                initialTopMostItemIndex={parseInt(store.getCurrentItem(paneNumber) - 1)}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return <Loading />
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