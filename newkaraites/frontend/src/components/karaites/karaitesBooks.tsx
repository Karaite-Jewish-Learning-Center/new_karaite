import React, {useContext, useState, FC, MouseEventHandler} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import KaraitePaneHeader from './KaraitePaneHeader';
import transform from '../../utils/transform'
import Loading from "../general/Loading";
import '../../css/_comments.css'
import Colors from '../../constants/colors'
import {TRANSFORM_TYPE} from '../../constants/constants'
import parse from 'html-react-parser'
import {storeContext} from "../../stores/context";


const HTML = 2

const BOOK = 0
const INTRO = 1
const TOC = 2

interface KaraitesBooksInterface {
    paneNumber: number,
    refClick: MouseEventHandler,
    paragraphs: Array<any>,
    type: string,
    onClosePane: MouseEventHandler
}

const KaraitesBooks: FC<KaraitesBooksInterface> = ({paneNumber, refClick, paragraphs, type, onClosePane}) => {
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...')
    // book, intro, toc
    const [flags, setFlags] = useState<Array<boolean>>([true, false, false])
    const store = useContext(storeContext)

    const classes = useStyles()

    const onIntroClick = () => {
        setFlags([false, false, true])
    }
    const onTocClick = () => {
        setFlags([false, true, false])
    }
    const onBookClick = () => {
        setFlags([true, false, false])
    }
    const selectCurrent = (item: number): boolean => {
        if (store.panes.length === 1) {
            return false
        }
        return store.getCurrentItem(paneNumber) === item
    }

    const itemContent = (item: number, data: Array<any>) => {
        debugger
        return (<div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
            <div className={(type !== 'liturgy' ? classes.paragraph : classes.liturgy)}>

                {parse(data[HTML][0], {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}
            </div>
        </div>)


    }
    // initial can't be negative
    const topItem: number = store.getCurrentItem(paneNumber) - 1
    const initial: number = (topItem > 0 ? topItem : 0)

    return (
        <>

            <KaraitePaneHeader paneNumber={paneNumber}
                               onClosePane={onClosePane}
                               onIntroClick={onIntroClick}
                               onTocClick={onTocClick}
                               onBookClick={onBookClick}
            />

            <Virtuoso className={(flags[BOOK] ? classes.Show : classes.Hide)}
                      data={paragraphs}
                      initialTopMostItemIndex={initial}
                      endReached={(_) => setLoadingMessage('Text end.')}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading text={loadingMessage}/>
                          }
                      }}
            />
            <Virtuoso className={(flags[TOC] ? classes.Show : classes.Hide)}
                      data={store.getBookTOC(paneNumber)}
                      initialTopMostItemIndex={initial}
                      endReached={(_) => setLoadingMessage('Text end.')}
                      itemContent={itemContent}
                      components={{
                          Footer: () => {
                              return <Loading text={loadingMessage}/>
                          }
                      }}
            />
            {/*<Virtuoso className={(!toc ? classes.tocShow : classes.tocHide)}*/}
            {/*          data={store.getBookDetails(paneNumber)}*/}
            {/*          initialTopMostItemIndex={initial}*/}
            {/*          endReached={(_) => setLoadingMessage('Text end.')}*/}
            {/*          itemContent={itemContent}*/}
            {/*          components={{*/}
            {/*              Footer: () => {*/}
            {/*                  return <Loading text={loadingMessage}/>*/}
            {/*              }*/}
            {/*          }}*/}
            {/*/>*/}

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
        "&:hover": {
            background: Colors['bibleSelectedVerse']
        },
    },
    paragraph: {
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: 600,
        lineHeight: 1.8,
        margin: 'auto',
    },
    liturgy: {
        maxWidth: '100%',
        margin: 'auto',
    },
    selected: {
        backgroundColor: Colors['rulerColor']
    },
    Hide: {
        display: 'none',
    },
    Show: {
        display: 'block',
    }
}))


export default KaraitesBooks