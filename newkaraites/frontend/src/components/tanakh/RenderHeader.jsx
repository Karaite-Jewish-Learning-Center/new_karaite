import React, {useContext} from 'react'
import {Typography} from '@material-ui/core';
import {englishBookNameToHebrew, unslug} from '../../utils/utils'
import {indoArabicToHebrewCardinal} from '../../utils/english-hebrew/numberConvertion'
import {Grid} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles'
import {storeContext} from "../../stores/context";
import LanguageButton from "../buttons/LanguageButton";
import {CloseButton} from "../buttons/CloseButton";
import {devLog} from "../messages/devLog";
import {TextToSpeechButton} from "../buttons/textToSpeechButton";
import {AudiobookBottom} from "../buttons/audiobookBottom";


const RenderHeader = ({
                          book,
                          paneNumber,
                          chapter,
                          onClosePane,
                          flip,
                          onSpeakOnOffHe,
                          onSpeakOnOffEn,
                          onAudioBookOnOff,
                          audioBookPlaying,
                      }) => {

    const store = useContext(storeContext)
    const lang = store.getLanguage(paneNumber)
    const classes = useStyles({lang})

    const onClose = () => {
        onClosePane(paneNumber)
    }

    book = unslug(book)

    const HeaderBody = ({chapter}) => {
        switch (lang) {
            case 'en_he':
                return (
                    <>
                        <Grid item xs={3} key={2}>
                            <Typography className={classes.hebrewBook}>{englishBookNameToHebrew(book)}</Typography>
                        </Grid>
                        <Grid item xs={1} key={3}>
                            <TextToSpeechButton
                                onClick={onSpeakOnOffHe}
                                onOff={flip[0]}
                            />
                            <AudiobookBottom
                                onClick={onAudioBookOnOff}
                                onOff={audioBookPlaying}
                            />
                        </Grid>
                        <Grid item xs={2} key={4}>
                            <Typography className={classes.chapterView}>{chapter}</Typography>
                        </Grid>
                        <Grid className={classes.adjust} item xs={1} key={5}>
                            <TextToSpeechButton
                                onClick={onSpeakOnOffEn}
                                onOff={flip[1]}
                            />

                        </Grid>
                        <Grid item xs={3} key={6}>
                            <Typography className={classes.englishBook}>{book} </Typography>
                        </Grid>

                    </>
                )
            case 'he':
                return (
                    <>
                        <Grid item xs={9} key={7}>
                            <Typography className={classes.hebrewBook}>
                                {englishBookNameToHebrew(book)}
                                {' '}
                                {indoArabicToHebrewCardinal(chapter)}
                            </Typography>
                        </Grid>
                        <Grid item xs={1} key={8}>
                            <TextToSpeechButton
                                onClick={onSpeakOnOffHe}
                                onOff={flip[0]}
                            />
                            <AudiobookBottom
                                onClick={onAudioBookOnOff}
                                onOff={audioBookPlaying}
                            />
                        </Grid>
                    </>
                )
            case 'en':
                return (
                    <>
                        <Grid item xs={9} key={9}>
                            <Typography className={classes.englishBook}>
                                {book}
                                {' '}
                                {chapter}
                            </Typography>
                        </Grid>
                        <Grid item xs={1} key={10}>
                            <TextToSpeechButton
                                onClick={onSpeakOnOffEn}
                                onOff={flip[1]}
                            />
                        </Grid>
                    </>
                )
            default: {
                devLog(`Unknown language: ${lang}`)
            }
        }
    }

    return (
        <Grid container className={classes.header} direction="row">
            <Grid item xs={1} key={0}>
                <CloseButton onClick={onClose}/>
            </Grid>
            <HeaderBody chapter={chapter}/>
            <Grid item xs={1} key={1}>
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
        textAlign: 'center',
    },
    hebrewBook: {
        textAlign: ((props) => props.lang === 'he' ? 'center' : 'right'),
        verticalAlign: 'middle',
        direction: 'rtl',
        fontFamily: 'SBL Hebrew',
        paddingTop: 10,
        [theme.breakpoints.down('sm')]: {
            marginRight: -5,
        },

    },
    center: {
        maxWidth: '31.5%',
    },
    adjust: {
        [theme.breakpoints.down('sm')]: {
            marginLeft: '-23px',
            marginRight: 8,
        },
    },
    chapterView: {
        textAlign: 'center',
        verticalAlign: 'middle',
        paddingTop: 10,
        [theme.breakpoints.down('sm')]: {
            paddingRight: 10,
        },
    },
    englishBook: {
        verticalAlign: 'middle',
        textAlign: ((props) => props.lang === 'en' ? 'center' : 'left'),
        paddingTop: 10,
        paddingLeft: 30,
        [theme.breakpoints.down('sm')]: {
            paddingLeft: ((props) => props.lang === 'en' ? 33 : 0),
        },

    },

}));

export default RenderHeader