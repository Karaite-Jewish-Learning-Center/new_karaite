import React, {FC, useContext, useRef, useState} from 'react'
import {ListRange, TableVirtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {storeContext} from "../../stores/context";
import {observer} from 'mobx-react-lite'
import {toJS} from 'mobx'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import {ClosePanes, RefClick} from '../../types/commonTypes';
import {CloseButton} from "../buttons/CloseButton";
import {Grid} from '@material-ui/core';
import {InfoButton} from '../buttons/InfoButton';
import {TocButton} from '../buttons/TocButton';
import {BookButton} from '../buttons/BookButton';
import {MusicSelect} from '../buttons/music-select';
import {BuyButton} from '../buttons/BuyButton';
import {iOS, unslug} from '../../utils/utils';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
    START_AUDIO_BOOK,
    AUDIO_BOOK_ID,
    SCROLL_LATENCY_MS,
    SCROLL_LATENCY_SECONDS, audioBooksUrl,
} from "../../constants/constants";
import {AudioBookContext} from '../../stores/audioBookContext';

const HEBREW = 0
const TRANSLITERATION = 1
const ENGLISH = 2
const BREAK = 10

interface BooksInterface {
    paneNumber: number,
    bookData: any[]
    details: any,
    refClick: RefClick,
    onClosePane: ClosePanes
}

const BookGrid: FC<BooksInterface> = ({paneNumber, bookData, details, refClick, onClosePane}) => {
    const classes = useStyles()
    const store = useContext(storeContext)
    const audioBookStore = useContext(AudioBookContext)
    const matches = useMediaQuery('(min-width:600px)');
    const direction = (matches ? 'row' : 'column')
    const xsColumns1 = (matches ? 4 : 12)
    const xsColumns2 = (matches ? 2 : 12)
    const book = store.getBook(paneNumber)
    const [audioBookPlaying, setAudioBookPlaying] = useState(false)
    const [distanceFromTop, setDistanceFromTop] = useState(0)
    const virtuoso = useRef(null)

    if (bookData === undefined || bookData.length === 0) return null;

    let x = toJS(bookData)
    let y = toJS(details)

    const callFromEnded = (set = true) => {
        let currentItem = store.getCurrentItem(paneNumber)
        if (audioBookStore.getIsPlaying()) {
            store.setCurrentItem(currentItem + 1, paneNumber)
        }
        setTimeout(() => {
            //     @ts-ignore
            virtuoso.current.scrollToIndex({
                index: currentItem,
                align: 'start',
                behavior: 'smooth'
            })

        }, SCROLL_LATENCY_MS)
    }
    const onTimeUpdate = (currentTime: number) => {
        const [start, end, id] = store.getAudioBookData(paneNumber)
        const lastId = store.getLastId(paneNumber)

        if (start === 0 && end === 0) {
            setAudioBookPlaying(false)
            audioBookStore.stop()
            return
        }

        if (currentTime + SCROLL_LATENCY_SECONDS > end && lastId === id) {
            callFromEnded(false)
        }
    }
    const onAudioBookEnded = () => {
        setAudioBookPlaying(() => false)
        onAudioBookOnOff()
    }
    const onAudioBookOnOff = () => {

        if (!audioBookPlaying) {
            let audioData = store.getAudioBookData(paneNumber)
            store.setLastId(audioData[AUDIO_BOOK_ID], paneNumber)
            const audioFile = store.getBookAudioFile(paneNumber)
            audioBookStore.load(`${audioBooksUrl}${audioFile}`, book)
            audioBookStore.play(audioData[START_AUDIO_BOOK], onTimeUpdate, onAudioBookEnded)
            setAudioBookPlaying(() => true)
        } else {
            setAudioBookPlaying(() => false)
        }

    }
    const endReached = (index: number) => {
        // setDistanceFromTop(distanceFromTop + 1)
        console.log('endReached', index, distanceFromTop)
    }
    let visibilityChanged = (range: ListRange) => {
        // store.setCurrentItem(range.startIndex, paneNumber)
        console.log('visibilityChanged', range.startIndex, range.endIndex)
        // store.setGridVisibleRange(paneNumber, range.startIndex, range.endIndex)
    }
    const onClose = () => {
        onClosePane(paneNumber)
    }
    const onIntro = () => {
        // onIntroClick(paneNumber)
    }
    const onToc = () => {
        // onTocClick(paneNumber)
    }
    const onBook = () => {
        // onBookClick(paneNumber)
    }
    const onBuy = () => {
        // window.open(details.buy_link)
    }
    const updateItemDistance = (i: number) => {
        console.log('updateItemDistance', store.getGridVisibleRangeStart(paneNumber))
        setDistanceFromTop(i - store.getGridVisibleRangeStart(paneNumber))
    }
    const onClick = (index: number) => {
        updateItemDistance(index)
        let x = visibilityChanged
        visibilityChanged = () => {

        }

        //store.setCurrentItem(index, paneNumber)
        let c = store.getGridVisibleRangeStart(paneNumber)
        console.log('top item before scroll', c)
        //@ts-ignore
        virtuoso.current.scrollToIndex({
            index: 10,
            align: 'start',
            behavior: 'smooth'
        })
        visibilityChanged = x
    }
    const ItemContent = (index: number, data: any) => {
        const startIndex = store.getGridVisibleRangeStart(paneNumber)
        const found = false //index === startIndex + distanceFromTop
        // let d = toJS(data)
        // console.log(d)
        // console.log(data.book_text[HEBREW])
        if (data[HEBREW].length !== 0 && data[TRANSLITERATION].length !== 0) {
            return (
                <TableCell className={`${classes.tableCell}${found ? classes.highlight : ''}`}
                           onClick={onClick.bind(this, index)}
                >
                    <Typography className={`${classes.hebrew} ${(data[BREAK] === "1" ? classes.break : '')}`}>{data[HEBREW]}</Typography>
                    <Typography className={`${classes.transliteration} ${(data[BREAK] === "1" ? classes.break : '')}`}>{data[TRANSLITERATION]}</Typography>
                </TableCell>
            )
        } else {
            return (
                <TableCell className={`${classes.tableCell}${found ? classes.highlight : ''}`}
                           onClick={onClick.bind(this, index)}
                >
                    <Typography variant="body1" className={`${classes.english} ${(data[BREAK] === "1" ? classes.break : '')}`}>{data[ENGLISH]}</Typography>
                </TableCell>
            )
        }
    }
    const fixedHeaderContent = () => (
        <TableRow>
            <TableCell className={classes.header}>
                <Grid container
                      direction={direction}
                      className={classes.resources}
                      justifyContent="flex-start"
                      alignItems="center"
                      spacing={1}>

                    <Grid item xs={xsColumns1}>
                        <p className={classes.pButtons}>
                            <CloseButton onClick={onClose}/>
                            <InfoButton onClick={onIntro}/>
                            <TocButton onClick={onToc}/>
                            <BookButton onClick={onBook}/>
                            {/*<MusicSelect songs={details.songs_list}/>*/}
                            {/*{(details.buy_link === '' ? null : <BuyButton onClick={onBuy}/>)}*/}
                        </p>
                    </Grid>

                    <Grid item xs={xsColumns1}>
                        <Typography variant="h6" className={classes.hebrewTitle}>
                            {details.book_title_he}
                        </Typography>
                        <Typography variant="h6" className={classes.englishTitle}>
                            {details.book_title_en}
                        </Typography>
                    </Grid>
                    <Grid item xs={xsColumns1}>
                    </Grid>
                </Grid>
            </TableCell>
        </TableRow>
    )

    const TableComponents = {
        // Scroller: React.forwardRef((props, ref) => <TableContainer component={Paper}  {...props} ref={ref}/>),
        // @ts-ignore
        Table: (props) => <Table {...props} className={classes.table}/>,
        TableHead: TableHead,
        TableRow: TableRow,
        // @ts-ignore
        TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} className={classes.tBody}/>),
    }

    // @ts-ignore
    return (
        <TableVirtuoso
            className={classes.table}
            data={bookData}
            ref={virtuoso}
            // initialTopMostItemIndex={store.getCurrentItem(paneNumber)}
            // @ts-ignore
            components={TableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={ItemContent}
            rangeChanged={visibilityChanged}
            endReached={endReached}

        />
    )
}

export default observer(BookGrid)


const useStyles = makeStyles((theme) => ({
    container: {
        margin: 'auto',
        width: '95vw',
        height: '100vh',
    },
    table: {
        margin: 'auto',
        width: '100%',

    },
    tBody: {
        border: 'none',
    },
    paper: {
        height: '100%',
        backgroundColor: 'green'
    },
    tableCell: {
        width: '100%',
        padding: 0,
        border: 'none',
    },
    highlight: {
        backgroundColor: (theme.palette.type === 'light' ? 'lightblue' : '#303030'),
    },
    paragraph: {
        width: '100%',
    },
    hebrew: {
        width: '50%',
        float: 'left',
        fontFamily: 'SBL Hebrew',
        fontSize: 19,
        textAlign: 'right',
        direction: 'rtl',
        margin: 0,
        padding: 1,
        paddingRight: 10,
    },
    transliteration: {
        width: '50%',
        float: 'left',
        textAlign: 'left',
        fontSize: 19,
        direction: 'ltr',
        margin: 0,
        padding: 1,
        paddingLeft: 10,
    },
    english: {
        textAlign: 'center',
        fontSize: 19,
        color: 'red',
        direction: 'ltr',
        margin: 0,
        padding: 1,
    },
    break: {
        marginBottom: 15,
    },
    header: {
        minWidth: '100%',
        height: 50,
        backgroundColor: (theme.palette.type === 'light' ? 'lightgrey' : '#444040'),
    },
    hebrewTitle: {
        width: '50%',
        float: 'left',
        textAlign: 'right',
        direction: 'rtl',
        fontFamily: 'SBL Hebrew',
        fontSize: 20,
        paddingRight: 5,
        whiteSpace: 'nowrap',
    },
    englishTitle: {
        width: '50%',
        float: 'right',
        textAlign: 'left',
        direction: 'ltr',
        fontSize: 20,
        paddingLeft: 5,
        whiteSpace: 'nowrap',
    },
    resources: {
        padding: 0,
        paddingTop: (iOS() ? 50 : 0),
        marginRight: 0,
        minWidth: '100%',
        minHeight: 60,
        margin: -12,
    },
    pButtons: {
        margin: 0,
        padding: 0,
        whiteSpace: 'nowrap',
    },
}))