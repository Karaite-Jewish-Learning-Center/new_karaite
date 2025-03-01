import { Collapse, Grid, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CommentIcon from '@material-ui/icons/Comment';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { FC, useContext, useRef, useState } from 'react';
import { ListRange, TableVirtuoso } from 'react-virtuoso';
import {
    SCROLL_LATENCY_MS,
    SCROLL_LATENCY_SECONDS,
    songsUrl
} from "../../constants/constants";
import { AudioBookContext } from '../../stores/audioBookContext';
import { storeContext } from "../../stores/context";
import { ClosePanes, RefClick } from '../../types/commonTypes';
import { iOS } from '../../utils/utils';
import { AudioBookButton } from '../buttons/AudioBookButton';
import { BuyButton } from '../buttons/BuyButton';
import { CloseButton } from "../buttons/CloseButton";

const HEBREW = 0
const TRANSLITERATION = 1
const ENGLISH = 2
const RECITER = 6
const BREAK = 10
const FILLER = 11
const PATTERN = 12
const TOP_LINES = 0
const COMMENTS = 11
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
    const hasSongs = store.hasSongsBetter(paneNumber)
    const data = toJS(bookData)
    const [openComments, setOpenComments] = useState<{[key: number]: boolean}>({});
    debugger
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
    const onClose = () => {
        audioBookStore.stop()
        onClosePane(paneNumber)
    }
    const updateItemDistance = (i: number) => {
        store.setCurrentItem(i, paneNumber)
    }
    const onClick = (index: number) => {
        updateItemDistance(index)
    }
    const toggleComment = (index: number) => {
        setOpenComments(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };
    const ItemContent = (index: number, data: any) => {
        const currentIndex = store.getCurrentItem(paneNumber)
        let found = index === currentIndex
        const hebrewLen = data[HEBREW].length > 0
        const transliterationLen = data[TRANSLITERATION].length > 0
        const englishLen = data[ENGLISH].length > 0
        const hasComment = data[COMMENTS] && data[COMMENTS].length > 0

        if (hebrewLen || transliterationLen || englishLen) {
            const breakLine = (data[BREAK] === "1" ? classes.break : '')
            const highlight = (found ? classes.highlight : '')

            if (hebrewLen && transliterationLen) {
                const qahal = (data[RECITER] === "Qahal" ? classes.qahal : '')

                return (
                    <TableCell className={`${classes.tableCell} ${highlight}`} onClick={onClick.bind(this, index)}>
                        <div className={classes.rowContainer}>
                             <div className={classes.mainContent}>
                                <div className={classes.contentWrapper}>
                                    <Typography className={`${classes.hebrew}`}>{data[HEBREW]}</Typography>
                                    <Typography className={`${classes.transliteration} ${breakLine}`}>{data[TRANSLITERATION]}</Typography>
                                </div>
                                <Typography className={`${classes.english} ${breakLine} ${qahal}`}>{data[ENGLISH]}</Typography>
                                
                            </div>
                            <div className={classes.reciterRow}>
                                {data[RECITER] && (
                                    <div className={classes.reciterContainer}>
                                        <Typography className={classes.reciter}>{data[RECITER]}</Typography>
                                    </div>
                                )}
                                {hasComment && (
                                    <IconButton 
                                        className={classes.commentButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleComment(index);
                                        }}
                                        size="small"
                                    >
                                        <CommentIcon fontSize="small" color={openComments[index] ? "primary" : "action"} />
                                    </IconButton>
                                )}
                               
                            </div>
                             {hasComment && (
                                     
                                        <Collapse in={openComments[index]} timeout="auto" unmountOnExit>
                                            <div className={classes.commentContainer}>
                                                <Typography className={classes.comment}>{data[COMMENTS]}</Typography>
                                            </div>
                                        </Collapse>
                                   
                                )}
                           
                        </div>
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
                      className={classes.resources}
                      justifyContent="center"
                      alignItems="center"
                      spacing={1}>

                    <Grid item xs={12} className={classes.buttonContainer}>
                        <div className={classes.pButtons}>
                            <CloseButton onClick={onClose}/>
                            {(hasSongs ? <AudioBookButton onClick={onAudioBookOnOff} onOff={audioBookPlaying} isSpeechError={false}/> : null)}
                            {(details.buy_link === '' ? null : <BuyButton onClick={onBuy}/>)}
                        </div>
                    </Grid>

                    <Grid item xs={12}>
                        <div className={classes.titleContainer}>
                            <Typography variant="h6" className={classes.hebrewTitle}>
                                {details.book_title_he}
                            </Typography>
                            <Typography variant="h6" className={classes.englishTitle}>
                                {details.book_title_en}
                            </Typography>
                        </div>
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
            className={classes.virtuosoTable}
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
        padding: theme.spacing(1),
        border: 'none',
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(0.5),
        },
    },
    rowContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
    },
    mainContent: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        paddingBottom: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    reciterContainer: {
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: theme.spacing(0.5),
    },
    highlight: {
        backgroundColor: (theme.palette.type === 'light' ? 'rgba(167, 176, 176, 0.42)' : 'rgba(211, 223, 223, 0.15)'),
    },
    paragraph: {
        width: '100%',
    },
    hebrew: {
        width: '50%',
        fontFamily: 'SBL Hebrew',
        fontSize: 19,
        textAlign: 'right',
        direction: 'rtl',
        margin: 0,
        padding: theme.spacing(0.5),
        paddingRight: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            fontSize: 17,
        },
    },
    transliteration: {
        width: '50%',
        textAlign: 'left',
        fontSize: 19,
        direction: 'ltr',
        margin: 0,
        padding: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            fontSize: 17,
        },
    },
    english: {
        width: '100%',
        textAlign: 'center',
        fontSize: 19,
        color: (theme.palette.type === 'light' ? '#575656FF' : '#C5C4C4FF'),
        direction: 'ltr',
        margin: 0,
        padding: theme.spacing(0.5),
        marginTop: theme.spacing(0.5),
        [theme.breakpoints.down('sm')]: {
            fontSize: 17,
        },
    },
    break: {
        paddingBottom: theme.spacing(2),
    },
    header: {
        minWidth: '100%',
        height: 'auto',
        padding: theme.spacing(1),
        backgroundColor: (theme.palette.type === 'light' ? 'lightgrey' : '#444040'),
    },
    titleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    hebrewTitle: {
        width: '50%',
        textAlign: 'right',
        direction: 'rtl',
        fontFamily: 'SBL Hebrew',
        fontSize: 20,
        padding: theme.spacing(0.5),
        paddingRight: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            fontSize: 18,
        },
    },
    englishTitle: {
        width: '50%',
        textAlign: 'left',
        direction: 'ltr',
        fontSize: 20,
        padding: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            fontSize: 18,
        },
    },
    resources: {
        padding: 0,
        paddingTop: (iOS() ? 50 : 0),
        marginRight: 0,
        width: '100%',
        minHeight: 60,
        margin: -12,
    },
    pButtons: {
        margin: 0,
        padding: 0,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        [theme.breakpoints.up('sm')]: {
            justifyContent: 'flex-start',
        },
    },
    qahal: {
        marginBottom: theme.spacing(2.5),
    },
    reciter: {
        textAlign: 'center',
        fontSize: 16,
        color: (theme.palette.type === 'light' ? '#575656FF' : '#C5C4C4FF'),
        direction: 'ltr',
        margin: 0,
        padding: 0,
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
    virtuosoTable: {
        width: '100%',
        height: '100%',
        overflowX: 'hidden',
        [theme.breakpoints.down('xs')]: {
            fontSize: '90%',
        },
    },
    englishContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    commentButton: {
        padding: theme.spacing(0.25),
        marginLeft: theme.spacing(1),
    },
    commentContainer: {
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(1, 0),
    },
    comment: {
        width: '100%',
        fontSize: 18,
        fontStyle: 'italic',
        color: theme.palette.type === 'light' ? 'rgba(243, 9, 9, 0.98)' : 'rgba(216, 22, 22, 0.7)',
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
    },
    reciterRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(1),
    },
}))