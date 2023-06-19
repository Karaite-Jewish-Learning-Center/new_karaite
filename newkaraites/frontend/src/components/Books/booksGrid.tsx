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
import {AudioBookButton} from '../buttons/AudioBookButton';
import {iOS, unslug} from '../../utils/utils';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
    BETTER_START_AUDIO,
    BETTER_END_AUDIO,
    BETTER_AUDIO_BOOK_ID,
    SCROLL_LATENCY_MS,
    SCROLL_LATENCY_SECONDS,
    songsUrl,
} from "../../constants/constants";
import {AudioBookContext} from '../../stores/audioBookContext';

const HEBREW = 0
const TRANSLITERATION = 1
const ENGLISH = 2
const QUAHAL = 6
const BREAK = 10
const FILLER = 11
const TOP_LINES = 0

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
    // const xsColumns2 = (matches ? 2 : 12)
    const book = store.getBook(paneNumber)
    const [audioBookPlaying, setAudioBookPlaying] = useState(false)
    const [distanceFromTop, setDistanceFromTop] = useState(TOP_LINES)
    const virtuoso = useRef(null)

    if (bookData === undefined || bookData.length === 0) return null;

    const callFromEnded = () => {

        let currentItem = store.getCurrentItem(paneNumber)
        const len = bookData.length
        // skip english translation or any other that has filer = 1
        do
            currentItem++
        while (currentItem < len && bookData[currentItem][FILLER] === "1")

        store.setCurrentItem(currentItem, paneNumber)
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
        const [start, end, id, audioTrackEnd] = store.getBetterAudioData(paneNumber)
        const lastId = store.getLastId(paneNumber)

        if (currentTime + SCROLL_LATENCY_SECONDS >= end && lastId === id) {
            if (audioTrackEnd) {
                setAudioBookPlaying(false)
                audioBookStore.stop()
                return
            }
            callFromEnded()
        }
    }
    const onAudioBookEnded = () => {
        setAudioBookPlaying(() => false)
        onAudioBookOnOff()
    }
    const onAudioBookOnOff = () => {
        if (!audioBookPlaying) {
            const [start, end, id, audioTrackEnd] = store.getBetterAudioData(paneNumber)
            if( isNaN(start) || isNaN(end)){
                callFromEnded()
            }
            let audioData = toJS(store.getSongsBetter(paneNumber))
            debugger
            store.setLastId(audioData.id, paneNumber)
            audioBookStore.load(`${songsUrl}${audioData.song_file}`, book)
            store.getBetterAudioDataStart(paneNumber)
            audioBookStore.play(store.getBetterAudioDataStart(paneNumber), onTimeUpdate, onAudioBookEnded)
            setAudioBookPlaying(() => true)
        } else {
            audioBookStore.stop()
            setAudioBookPlaying(() => false)
        }

    }

    let visibilityChanged = (range: ListRange) => {
        store.setGridVisibleRange(paneNumber, range.startIndex, range.endIndex)
    }
    const onClose = () => {
        audioBookStore.stop()
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
        store.setCurrentItem(i, paneNumber)
    }
    const onClick = (index: number) => {
        updateItemDistance(index)
    }
    const ItemContent = (index: number, data: any) => {
        const currentIndex = store.getCurrentItem(paneNumber)
        const startIndex = store.getGridVisibleRangeStart(paneNumber)
        let found = index === currentIndex
        const hebrewLen = data[HEBREW].length > 0
        const transliterationLen = data[TRANSLITERATION].length > 0
        const englishLen = data[ENGLISH].length > 0

        if (hebrewLen || transliterationLen || englishLen) {
            const breakLine = (data[BREAK] === "1" ? classes.break : '')
            const highlight = (found ? classes.highlight : '')

            if (hebrewLen && transliterationLen) {
                console.log(data[QUAHAL],data[QUAHAL] === "Qahal"  )
                const qahal = (data[QUAHAL] === "Qahal" ? classes.qahal : '')

                return (
                    <TableCell className={`${classes.tableCell} ${highlight}`}
                               onClick={onClick.bind(this, index)}
                    >
                        <Typography className={`${classes.hebrew} ${breakLine} ${qahal}`}>{data[HEBREW]}</Typography>
                        <Typography className={`${classes.transliteration} ${breakLine}  ${qahal}`}>{data[TRANSLITERATION]}</Typography>
                    </TableCell>
                )
            } else {
                return (
                    <TableCell className={`${classes.tableCell} ${highlight}`}
                               onClick={onClick.bind(this, index)}
                    >
                        <Typography variant="body1" className={`${classes.english} ${breakLine}`}>{data[ENGLISH]}</Typography>
                    </TableCell>
                )
            }
        } else {
            return (
                <TableCell className={classes.tableCell}>
                    <Typography variant="body1" className={classes.english}>&nbsp;</Typography>
                </TableCell>
            )
        }
    }
    // @ts-ignore
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
                            {/*<InfoButton onClick={onIntro}/>*/}
                            {/*<TocButton onClick={onToc}/>*/}
                            {/*<BookButton onClick={onBook}/>*/}
                            {/*<BuyButton onClick={onBuy}/>*/}
                            <AudioBookButton onClick={onAudioBookOnOff} onOff={audioBookPlaying} isSpeechError={false}/>
                            {(details.buy_link === '' ? null : <BuyButton onClick={onBuy}/>)}
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
        marginTop: 100,
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
        backgroundColor: (theme.palette.type === 'light' ? '#11c4f114' : 'darkgrey'),
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
        color:  (theme.palette.type === 'light' ? '#575656FF' : '#C5C4C4FF'),
        direction: 'ltr',
        margin: 0,
        padding: 1,
    },
    break: {
        paddingBottom: 15,
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
    qahal: {
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
}))