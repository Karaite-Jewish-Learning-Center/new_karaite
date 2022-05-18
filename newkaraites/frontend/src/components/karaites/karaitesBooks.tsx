import React, {useContext, useState, useRef, FC, MouseEventHandler} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import {TableVirtuoso} from 'react-virtuoso'
import KaraitePaneHeader from './KaraitePaneHeader';
import transform from '../../utils/transform'
import Loading from "../general/Loading";
import '../../css/_comments.css'
import Colors from '../../constants/colors'
import {TRANSFORM_TYPE} from '../../constants/constants'
import parse from 'html-react-parser'
import {storeContext} from "../../stores/context";
import {Button, Typography} from '@material-ui/core';

const HTML = 2
const BOOK = 0
const TOC = 1
const INTRO = 2
const SUBJECT = 0
const INDEX = 1
const START_PARAGRAPH = 2
const loadingMessageEnd = ['Text end.', 'Introduction end.', 'Table of contents end.']

interface KaraitesBooksInterface {
    paneNumber: number,
    refClick: MouseEventHandler,
    paragraphs: Array<any>,
    details: any,
    type: string,
    onClosePane: MouseEventHandler,
}

interface TableBook {
    initial: number,
}

const KaraitesBooks: FC<KaraitesBooksInterface> = ({
                                                       paneNumber,
                                                       refClick,
                                                       paragraphs,
                                                       details,
                                                       type,
                                                       onClosePane,
                                                   }) => {


    const store = useContext(storeContext)
    const [loadingMessage, setLoadingMessage] = useState<string>('Loading...')
    // book, intro, toc
    const [flags, setFlags] = useState<Array<boolean>>([true, false, false])
    const classes = useStyles()
    const virtuoso = useRef(null);

    if (paragraphs.length === 0) {
        return <Loading/>
    }

    // const lang = store.getBookDetails(paneNumber)

    const setEndReached = (i: number): number => {
        setLoadingMessage(loadingMessageEnd[0])
        return i
    }

    const onIntroClick = () => {
        setFlags([false, false, true])
    }

    const onTocClick = () => {
        setFlags([false, true, false])
    }

    const onBookClick = () => {
        setFlags([true, false, false])
    }

    const onButtonClick = (starParagraph: number) => {
        setFlags([true, false, false])
        // only works this way because the virtuoso is not re-rendered
        setTimeout(() => {
            // @ts-ignore
            virtuoso.current.scrollToIndex(starParagraph - 1, {
                align: 'top',
                behavior: 'smooth',
            })
        }, 100)
    }

    const selectCurrent = (item: number): boolean => {
        if (store.panes.length === 1) {
            return false
        }
        return store.getCurrentItem(paneNumber) === item
    }


    const itemTable = (item: number, data: Array<any>) => {

        return (
            <tr>
                {parse(data[HTML][0], {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}
                {parse(data[HTML][2], {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}
            </tr>
        )

    }
    const itemContent = (item: number, data: Array<any>) => {

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

    const itemIntroduction = (item: number, data: string) => {
        return (<div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
            <div className={(type !== 'liturgy' ? classes.paragraph : classes.liturgy)}>
                {parse(data, {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}
            </div>
        </div>)
    }

    const itemToc = (item: number, data: any) => {
        if (data[INDEX] === '') {
            // one column TOC
            return (<div className={`${classes.tocParagraph} ${selectCurrent(item) ? classes.selected : ''}`}>
                <p className={classes.tocItem} style={{direction: details.direction}} onClick={onButtonClick.bind(this, data[START_PARAGRAPH])}>
                    {data[SUBJECT]}
                </p>
            </div>)
        }


        // 2 columns TOC
        return (<div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
            <div className={(type !== 'liturgy' ? classes.paragraph : classes.liturgy)}>
                <Button className={classes.tocButton} onClick={onButtonClick.bind(this, data[START_PARAGRAPH])}>
                    <div className={classes.heLeft}>
                        <p className={classes.he}>{data[INDEX]}</p>
                    </div>
                    <div className={classes.filler}>
                    </div>
                    <div className={classes.enRight}>
                        <p className={classes.en}>{data[SUBJECT]}</p>
                    </div>
                </Button>
            </div>
        </div>)
    }

    const TableBook: FC<TableBook> = ({initial}) => {

        if (details.table_book) {
            const tableBook = 'table-book'
            return (
                <TableVirtuoso
                    className={`${tableBook}  ${(flags[BOOK] ? classes.Show : classes.Hide)}`}
                    data={paragraphs}
                    ref={virtuoso}
                    initialTopMostItemIndex={initial}
                    endReached={setEndReached}
                    itemContent={itemTable}
                    // components={{
                    //     Footer: () => {return <Loading text={loadingMessage}/>}
                    // }}
                />)
        } else {
            return (
                <Virtuoso className={(flags[BOOK] ? classes.Show : classes.Hide)}
                          data={paragraphs}
                          ref={virtuoso}
                          initialTopMostItemIndex={initial}
                          endReached={setEndReached}
                          itemContent={itemContent}
                          components={{
                              Footer: () => {
                                  return <Loading text={loadingMessage}/>
                              }
                          }}
                />
            )
        }
    }
    if (details.book_title_en === undefined) return null

    // initial can't be negative
    const topItem: number = store.getCurrentItem(paneNumber) - 1
    const initial: number = (topItem > 0 ? topItem : 0)

    const intro = (details.intro === undefined ? [''] : [details.intro])
    const toc = (details.toc === undefined ? [''] : details.toc)


    return (
        <>
            <KaraitePaneHeader paneNumber={paneNumber}
                               onClosePane={onClosePane}
                               onIntroClick={onIntroClick}
                               onTocClick={onTocClick}
                               onBookClick={onBookClick}
                               details={details}
            />
            <TableBook initial={initial}/>

            <Virtuoso className={`${(flags[TOC] ? classes.Show : classes.Hide)} ${classes.toc}`}
                      data={toc}
                      initialTopMostItemIndex={0}
                      itemContent={itemToc}
                      components={{
                          Footer: () => {
                              return <Loading text={loadingMessageEnd[2]}/>
                          }
                      }}
            />
            <Virtuoso className={`${(flags[INTRO] ? classes.Show : classes.Hide)} ${classes.head}`}
                      data={intro}
                      initialTopMostItemIndex={0}
                      itemContent={itemIntroduction}
                      components={{
                          Footer: () => {
                              return <Loading text={loadingMessageEnd[1]}/>
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
        alignContent: 'center',
    },
    paragraphContainer: {
        fontFamily: 'SBL Hebrew',
        "&:hover": {
            background: Colors['bibleSelectedVerse']
        },
        width: '100%',
    },
    paragraph: {
        fontFamily: 'SBL Hebrew',
        fontSize: '21',
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: 600,
        margin: 'auto',
    },
    liturgy: {
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    paragraphContainerHeEn: {
        paddingLeft: 20,
        paddingRight: 20,
        width: 'auto',
        margin: 'auto',
        direction: 'rtl',
    },
    tocParagraph: {
        "&:hover": {
            background: Colors['bibleSelectedVerse']
        },
        fontFamily: 'SBL Hebrew',
        maxWidth: '100%',
        marginLeft: '%',
        marginRight: '10%',
        fontSize: '21px',
        lineHeight: 'initial',
        direction: 'rtl'
    },
    tocItem: {
        cursor: 'pointer',
    },
    hebrew: {
        float: 'left',
    },
    english: {
        float: 'right',
    },
    selected: {
        backgroundColor: Colors['rulerColor']
    },
    Hide: {
        display: 'none',
    },
    Show: {
        display: 'block',
    },
    heLeft: {
        fontFamily: 'SBL Hebrew',
        float: 'left',
        direction: 'rtl',
        textAlign: 'right',
        lineHeight: 'initial',
        fontSize: '20.35px',
        verticalAlign: 'top',
        width: '100%',
         border: '1px solid red',
    },
    filler:{
        width: '0',
    },
    heRight: {
        fontFamily: 'SBL Hebrew',
        lineHeight: 'initial',
        float: 'right',
        textAlign: 'right',
        verticalAlign: 'top'
    },
    enRight: {
        textAlign: 'left',
        direction: 'ltr',
        marginLeft: 15,
        fontSize: 21,
        width:'100%',
        verticalAlign: 'top',
        fontFamily: 'SBL Hebrew',
        lineHeight: 'initial',
        border: '1px solid blue',
    },
    heRightCenter: {
        direction: 'rtl',
        border: '1px solid red',
        textAlign: 'right',
        minWidth: '100%',
    },
    he: {
        direction: 'rtl',
    },
    en: {
        direction: 'ltr',
    },
    head: {
        marginTop: '50px',
    },
    toc: {
        top: 70,
        minWith: '80%',
    },
    tocButton: {
        textTransform: 'none',
        width: '100%',
    },
}))


export default KaraitesBooks