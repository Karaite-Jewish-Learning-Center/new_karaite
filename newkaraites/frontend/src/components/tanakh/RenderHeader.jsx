import React, {useContext} from 'react'
import Colors from '../../constants/colors';
import {Typography} from '@material-ui/core';
import {englishBookNameToHebrew, unslug} from '../../utils/utils'
import {indoArabicToHebrewCardinal} from '../../utils/english-hebrew/numberConvertion'
import {Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles'
import {observer} from 'mobx-react-lite';
import {storeContext} from "../../stores/context";
import LanguageButton from "../buttons/LanguageButton";
import {CloseButton} from "../buttons/CloseButton";


const RenderHeader = ({book, paneNumber}) => {
    const store = useContext(storeContext)
    const lang = store.getLanguage(paneNumber)
    const classes = useStyles({lang})

    const onClose = () => store.closePane(paneNumber)

    book = unslug(book)

    const HeaderBody = ({chapter}) => {
        switch (lang) {
            case 'en_he':
                return (
                    <>
                        <Grid item xs={3} key={1}>
                            <Typography className={classes.hebrewBook}>{englishBookNameToHebrew(book)}</Typography>
                        </Grid>
                        <Grid item xs={4} key={2}>
                            <Typography className={classes.chapterView}>{chapter}</Typography>
                        </Grid>
                        <Grid item xs={3} key={3}>
                            <Typography className={classes.englishBook}>{book} </Typography>
                        </Grid>
                    </>
                )
            case 'he':
                return (
                    <Grid item xs={10} key={1}>
                        <Typography className={classes.hebrewBook}>
                            {englishBookNameToHebrew(book)}
                            {' '}
                            {indoArabicToHebrewCardinal(chapter)}
                        </Typography>
                    </Grid>
                )
            case 'en':
                return (
                    <Grid item xs={10} key={4}>
                        <Typography className={classes.englishBook}>
                            {book}
                            {' '}
                            {chapter}
                        </Typography>
                    </Grid>
                )
        }
    }

    return (
        <Grid container className={classes.header} direction="row">
            <Grid item xs={1} key={0}>
                <CloseButton onClick={onClose}/>
            </Grid>
            <HeaderBody chapter={store.getHeaderChapter(paneNumber)}/>
            <Grid item xs={1} key={4}>
                <LanguageButton paneNumber={paneNumber}/>
            </Grid>
        </Grid>
    )


}


const useStyles = makeStyles((theme) => ({
    header: {
        flexGrow: 1,
        minHeight: 50,
        maxHeight: 50,
        width: '100%',
        backgroundColor: Colors['rightPaneBackGround'],
        textAlign: 'center'
    },
    hebrewBook: {
        textAlign: ((props) => props.lang === 'he' ? 'center' : 'right'),
        verticalAlign: 'middle',
        direction: 'rtl',
        fontFamily: 'SBL Hebrew',
    },

    chapterView: {
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingRight: 23,
    },
    englishBook: {
        verticalAlign: 'middle',
        textAlign: ((props) => props.lang === 'en' ? 'center' : 'left'),
    },

}));

export default observer(RenderHeader)