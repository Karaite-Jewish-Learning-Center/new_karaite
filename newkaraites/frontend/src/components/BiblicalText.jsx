import React, {useEffect, useRef, useState} from 'react'
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles'
import ChapterHeaderVerse from '../components/biblicalChapter'
import './css/comments.css';
import Loading from "./Loading";
import PaneHeader from "./PaneHeader";
import {makeRandomKey} from "../utils/utils";

export default function BiblicalText({
                                         book,
                                         chapter,
                                         verse,
                                         highlight,
                                         fullBook,
                                         comment,
                                         onClosePane,
                                         onCommentOpen,
                                         paneNumber,
                                         bookData,
                                         chapters
                                     }) {

    const virtuoso = useRef(null);
    const classes = useStyles()

    const itemContent = (item, data) => {
        return (
            <ChapterHeaderVerse item={item}
                                data={data}
                                highlight={highlight}
                                bookData={bookData}
                                onCommentOpen={onCommentOpen}
                                paneNumber={paneNumber}
                                comment={comment}
            />
        )
    }

    const calculateIndex = (data) => {
        return (fullBook ? data['verses'].slice(0, chapter - 1).reduce((x, y) => x + y, 0) + verse - 1 : verse - 1)
    }

    useEffect(() => {
        let i = calculateIndex(bookData)
        virtuoso.current.scrollToIndex({
            index: i,
            align: 'center',
        });
    }, [])


    return (
        <div className={classes.virtuoso} key={makeRandomKey}>
            <PaneHeader book={book} chapter={chapter} verse={verse} onClosePane={onClosePane}/>
            <Virtuoso data={chapters}
                      // initialTopMostItemIndex={ calculateIndex(bookData)}
                      ref={virtuoso}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading text={(fullBook ? 'Book end.' : 'End of chapter.')}/>
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

}))
