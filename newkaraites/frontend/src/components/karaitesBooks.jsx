import React, {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import ReactHtmlParser from 'react-html-parser'
import {makeRandomKey} from "../utils/utils"
import PaneHeader from "./PaneHeader";
import Loading from "./Loading";

export default function KaraitesBooks({book, chapter, chapters, refClick, fullBook, visible}) {
    const classes = useStyles()


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

    return (
        <div className={classes.virtuoso}>
            <PaneHeader book={book} chapter={chapter}/>
            <Virtuoso data={chapters}
                      //rangeChanged={visible}
                      //initialTopMostItemIndex={visible.start}
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
