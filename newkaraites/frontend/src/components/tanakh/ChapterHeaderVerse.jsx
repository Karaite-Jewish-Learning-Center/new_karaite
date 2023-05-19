import React, {useContext, useEffect} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_RENDER_CHAPTER,
    REFS_HE,
    REFS_EN,
} from "../../constants/constants";
import Tooltip from '@material-ui/core/Tooltip';
import RefsBadge from "../general/RefsBadge";
import {observer} from 'mobx-react-lite';
import {storeContext} from '../../stores/context'
import {indoArabicToHebrew} from "../../utils/english-hebrew/numberConvertion";


const ChapterHeaderVerse = ({data, item, gridVisibleRange, paneNumber, audioBookPlaying, speaking}) => {
    const store = useContext(storeContext)
    const allBookData = store.getBookData(paneNumber)
    const lang = store.getLanguage(paneNumber)
    const classes = useStyles({lang})
    const chapter = data[BIBLE_CHAPTER]
    const renderChapter = data[BIBLE_RENDER_CHAPTER]
    const refsHe = parseInt(data[REFS_HE])
    const refsEn = parseInt(data[REFS_EN])
    let chapterHtml = null

    const updateItemDistance = (i) => {
        store.setCurrentItem(i, paneNumber)
        store.setDistance(i - gridVisibleRange.startIndex, paneNumber)
    }

    const onDoubleClick = (i) => {
        if (audioBookPlaying || speaking) {
           return
        }
        store.setCurrentItem(i, paneNumber)
        store.setDistance(0, paneNumber)
        store.setIsRightPaneOpen(!store.getIsRightPaneOpen(paneNumber), paneNumber)
    }

    const onClick = (i) => {
        if (audioBookPlaying || speaking) {
            return
        }

        updateItemDistance(i)
    }

    if (renderChapter === "1") {

        chapterHtml = (
            <div className={classes.chapter}>
                <div className={classes.chapterNumber}>
                    <Typography className={classes.ch}>{lang === 'he' ? indoArabicToHebrew(chapter) : chapter}</Typography>
                    <hr/>
                </div>
            </div>)
    }


    let current = null
    const startIndex = gridVisibleRange.startIndex
    if (audioBookPlaying || speaking) {
        current = store.getCurrentItem(paneNumber)
    } else {
        current = startIndex + store.getDistance(paneNumber)
    }
    let found = item === current


    useEffect(() => {
        store.setRefsChapterVerse(allBookData[current][BIBLE_CHAPTER], allBookData[current][BIBLE_VERSE], paneNumber)
        store.setVerseData(allBookData[current], paneNumber)
    }, [allBookData[current][BIBLE_CHAPTER], allBookData[current][BIBLE_VERSE], paneNumber])

    const ChapterBody = () => {
        switch (lang) {
            case 'en_he':
                return (
                    <>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refsHe} color="primary"/>
                        </div>
                        <div className={classes.verseHe}>
                            <Typography variant="body1" className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                        </div>
                        <div className={classes.verseNumber}>
                            <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                        </div>
                        <div className={classes.verseEn}>
                            <Typography variant="body1" className={classes.englishFont}>{data[BIBLE_ENGLISH]}</Typography>
                        </div>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refsEn} color="primary"/>
                        </div>
                    </>
                )
            case 'he':
                return (
                    <>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refsHe} color="primary"/>
                        </div>
                        <div className={classes.verseHe}>
                            <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                        </div>

                        <div className={classes.verseNumber}>
                            <Tooltip title={data[BIBLE_VERSE]} placement="top">
                                <Typography className={classes.vn}>{indoArabicToHebrew(data[BIBLE_VERSE])}</Typography>
                            </Tooltip>
                        </div>
                    </>
                )
            case 'en':
                return (
                    <>
                        <div className={classes.verseNumber}>
                            <Tooltip title={indoArabicToHebrew(data[BIBLE_VERSE])} placement="top">
                                <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                            </Tooltip>
                        </div>
                        <div className={classes.verseEn}>
                            <Typography className={classes.englishFont}>{data[BIBLE_ENGLISH]}</Typography>
                        </div>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refsEn} color="primary"/>
                        </div>
                    </>
                )
            default: {
                console.log(`Unknown language: ${lang}`)
            }
        }
    }
    return (
        <div className={classes.verse}>
            {chapterHtml}
            <div className={`${classes.textContainer} ${(found ? classes.selectVerse : '')}`}
                 onClick={onClick.bind(this, item)}
                 onDoubleClick={onDoubleClick.bind(this, item)}>
                <ChapterBody/>
            </div>

        </div>
    )
}


const useStyles = makeStyles(() => ({

    textContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'top',

    },
    chapter: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'default',
    },
    chapterTitle_he: {
        maxWidth: '35%',
        minWidth: '35%',
        margin: 10,
    },
    he: {
        fontSize: 22,
        direction: ((props) => props.lang === 'he' ? 'RTL' : 'LTR'),
        textDecoration: 'underline',
        textDecorationColor: '#c6c6c6',
    },
    en: {
        fontSize: 22,
        textDecoration: 'underline',
        textDecorationColor: '#c6c6c6',
    },
    ch: {
        fontSize: 18,
        color: 'gray',
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
    },
    chapterTitle_en: {
        maxWidth: '35%',
        minWidth: '35%',
        margin: 10,
    },
    chapterNumber: {
        minWidth: '5%',
        margin: 10,
        textAlign: 'center',
        verticalAlign: 'text-top',
        fontSize: 20,
        color: 'gray'
    },
    verseHe: {
        maxWidth: ((props) => props.lang === 'he' ? '45%' : '35%'),
        minWidth: ((props) => props.lang === 'he' ? '45%' : '35%'),
        textAlign: 'right',
        verticalAlign: 'center',
        margin: 10,
        fontFamily: 'SBL Hebrew',
        fontSize: '21px',
    },
    verseNumber: {
        margin: 10,
        maxWidth: '5%',
        minWidth: '5%',
        textAlign: 'center',
        alignSelf: 'center',
    },
    vn: {
        fontSize: 12,
        color: 'gray',
        direction: ((props) => props.lang === 'he' ? 'RTL' : 'LTR')
    },
    verse: {
        cursor: 'pointer',
    },
    verseEn: {
        maxWidth: ((props) => props.lang === 'en' ? '45%' : '35%'),
        minWidth: ((props) => props.lang === 'en' ? '45%' : '35%'),
        textAlign: 'left',
        verticalAlign: 'text-top',
        margin: 10,
        fontSize: '21px',
    },
    hebrewFont: {
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
        fontSize: 21,
    },
    englishFont: {
        direction: 'LTR',
        fontFamily: 'SBL Hebrew',
        fontSize: 21,
    },
    selectVerse: {
        backgroundColor: '#11c4f114',
    },
    references: {
        cursor: 'pointer',
        alignSelf: 'center',
        maxWidth: '5%',
    },
    playButton: {
        cursor: 'pointer',
        position: 'absolute',
        minWidth: '50',
    },
}))

export default observer(ChapterHeaderVerse)