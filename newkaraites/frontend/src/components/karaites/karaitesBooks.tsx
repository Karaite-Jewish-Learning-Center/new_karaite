import React, {useContext, useState, useRef, FC, MouseEventHandler} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {Virtuoso} from 'react-virtuoso'
import {TableVirtuoso} from 'react-virtuoso'
import KaraitePaneHeader from './KaraitePaneHeader';
import transform from '../../utils/transform'
import '../../css/_comments.css'
import '../../css/books.css'
import Colors from '../../constants/colors'
import {TRANSFORM_TYPE} from '../../constants/constants'
import parse from 'html-react-parser'
import {storeContext} from "../../stores/context";
import {Button} from '@material-ui/core';

const BOOK = 0
const TOC = 1
const INTRO = 2
const SUBJECT = 0
const INDEX = 1
const START_PARAGRAPH = 2
const ENGLISH = 0
const HEBREW = 2


interface KaraitesBooksInterface {
    paneNumber: number,
    refClick: MouseEventHandler,
    paragraphs: Array<any>,
    details: any,
    type: string,
    onClosePane: MouseEventHandler,
    jumpToIntro: boolean,
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
                                                       jumpToIntro,
                                                   }) => {

    const store = useContext(storeContext)
    // book, toc, intro
    const [flags, setFlags] = useState<Array<boolean>>([!jumpToIntro, false, jumpToIntro])
    const classes = useStyles()
    const virtuoso = useRef(null);

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
                {parse(data[HEBREW], {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}
                {parse(data[ENGLISH], {
                    replace: domNode => {
                        return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                    }
                })}

            </tr>
        )

    }
    const itemContent = (item: number, data: Array<any>) => {
        debugger
        let index = 2
        if(type==='Liturgy' || (type==='Comments' && details.book_language.indexOf('en')>=0)) index = 0
        return (
            <div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
                <div className={(type !== 'Liturgy' ? classes.paragraph : classes.liturgy)}>
                    {parse(data[index], {
                        replace: domNode => {
                            return transform(refClick, item, TRANSFORM_TYPE, paneNumber, domNode)
                        }
                    })}
                </div>
            </div>
        )
    }

    const itemIntroduction = (item: number, data: string) => {
        debugger
        return (<div className={`${classes.paragraphContainer} ${selectCurrent(item) ? classes.selected : ''}`}>
            <div className={(type !== 'Liturgy' ? classes.paragraph : classes.liturgy)}>
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
            <div className={(type !== 'Liturgy' ? classes.paragraph : classes.liturgy)}>
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
        debugger
        if (details.table_book) {
            const tableBook = 'table-book'
            return (
                <TableVirtuoso
                    className={`${tableBook}  ${(flags[BOOK] ? classes.Show : classes.Hide)}`}
                    data={paragraphs}
                    ref={virtuoso}
                    initialTopMostItemIndex={initial}
                    itemContent={itemTable}
                />
            )
        } else {
            return (
                <Virtuoso className={(flags[BOOK] ? classes.Show : classes.Hide)}
                          data={paragraphs}
                          ref={virtuoso}
                          initialTopMostItemIndex={initial}
                          itemContent={itemContent}
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
                              return (
                                  <div style={{padding: '1rem', textAlign: 'center'}}>
                                      Table of Contents end.
                                  </div>
                              )
                          }
                      }}/>
            <Virtuoso className={`${(flags[INTRO] ? classes.Show : classes.Hide)} ${classes.head}`}
                      data={intro}
                      initialTopMostItemIndex={0}
                      itemContent={itemIntroduction}/>
        </>
    )
}

const useStyles = makeStyles(() => ({
    virtuoso: {
        top: 70,
        position: 'fixed',
        width: '100%',
        height: '200%',
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
        fontSize: 21,
        paddingLeft: 20,
        paddingRight: 20,
        maxWidth: 600,
        margin: 'auto',
    },
    liturgy: {
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        maxWidth: '100%',
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
        marginLeft: '10%',
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
        // border: '1px solid red',
    },
    filler: {
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
        width: '100%',
        verticalAlign: 'top',
        fontFamily: 'SBL Hebrew',
        lineHeight: 'initial',
        // border: '1px solid blue',
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
    head: {},
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