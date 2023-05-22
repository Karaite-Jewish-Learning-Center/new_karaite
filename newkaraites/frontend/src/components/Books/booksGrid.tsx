import React, {FC, useContext, useRef} from 'react'
import {Virtuoso, TableVirtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {storeContext} from "../../stores/context";
import {observer} from 'mobx-react-lite'
import {toJS} from 'mobx'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
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
    const matches = useMediaQuery('(min-width:600px)');
    const direction = (matches ? 'row' : 'column')
    const xsColumns1 = (matches ? 5 : 12)
    const xsColumns2 = (matches ? 2 : 12)

    if (bookData === undefined || bookData.length === 0) return null;
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
    const ItemContent = (index: number, data: any) => {
        return (
            <>
                <TableCell className={classes.tableCell}>
                    <Typography className={classes.hebrew}>{data.book_text[HEBREW]}</Typography>
                    <Typography className={classes.transliteration}>{data.book_text[TRANSLITERATION]}</Typography>
                    <Typography variant="body1" className={classes.english}>
                        {data.book_text[ENGLISH]}
                    </Typography>
                    {(data.book_text[BREAK] === "1" && <div>&nbsp;</div>)}
                </TableCell>
            </>
        )
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
                    <CloseButton onClick={onClose}/>
                    <InfoButton onClick={onIntro}/>
                    <TocButton onClick={onToc}/>
                    <BookButton onClick={onBook}/>
                    {/*<MusicSelect songs={details.songs_list}/>*/}
                    {/*{(details.buy_link === '' ? null : <BuyButton onClick={onBuy}/>)}*/}
                </Grid>

                <Grid item xs={xsColumns2}>
                    <Typography variant="h6" className={classes.hebrewTitle}>
                        {details.hebrew_name}
                    </Typography>
                    <Typography variant="h6" className={classes.englishTitle}>
                        {details.english_name}
                    </Typography>
                </Grid>
            </Grid>


            </TableCell>
        </TableRow>
    )

    // @ts-ignore
    const TableComponents = {
        Scroller: React.forwardRef((props, ref) => <TableContainer component={Paper} {...props} ref={ref}/>),
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
            // @ts-ignore
            components={TableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={ItemContent}
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
        height: '100%',
    },
    tBody: {
        border: 'none',
    },
    tableCell: {
        width: '100%',
        padding: 0,
        border: 'none',
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
        padding: 0,
    },
    spacer: {},
    header: {
        minWidth: '100%',
        minHeight: 200,
        border: '1px solid blue',
        backgroundColor: 'lightgrey',
    },
    hebrewTitle: {
        width: '50%',
        float: 'left',
        textAlign: 'right',
        direction: 'rtl',
        fontFamily: 'SBL Hebrew',
        fontSize: 20,
        paddingRight: 5,
    },
    englishTitle: {
        width: '50%',
        float: 'right',
        textAlign: 'left',
        direction: 'ltr',
        fontSize: 20,
        paddingLeft: 5,
    },
    resources: {
        padding: 0,
        paddingTop: (iOS() ? 50 : 0),
        marginRight: 0,
        minWidth: '100%',
        minHeight: 60,
        backgroundColor: 'lightgrey',
    },
}))