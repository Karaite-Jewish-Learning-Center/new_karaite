import React, {useContext, useEffect} from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Colors from "../../constants/colors";
import Typography from '@material-ui/core/Typography';
import {
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_RENDER_CHAPTER,
    BIBLE_EN_CM,
    BIBLE_REFS
} from "../../constants/constants";
import RefsBadge from "../general/RefsBadge";
import {observer} from 'mobx-react-lite';
import {versesByBibleBook} from '../../constants/constants';
import {storeContext} from '../../stores/context'
import {devLog} from "../messages/devLog";
import {indoArabicToHebrew} from "../../utils/english-hebrew/numberConvertion";


const ChapterHeaderVerse = (props) => {
    const store = useContext(storeContext)
    const {data, item, gridVisibleRange, paneNumber} = props
    const allBookData = store.getBookData(paneNumber)
    const lang = store.getLanguage(paneNumber)
    const classes = useStyles({lang})

    let chapterHtml = null

    let chapter = data[BIBLE_CHAPTER]
    let renderChapter = data[BIBLE_RENDER_CHAPTER]
    let refs = parseInt(data[BIBLE_EN_CM]) + parseInt(data[BIBLE_REFS])

    const calculateCurrentChapter = () => {
        let book = store.getBook(paneNumber)
        let avg = gridVisibleRange.startIndex + 1
        let start = 0
        let end = 0
        for (let i = 0; i < versesByBibleBook[book].length; i++) {
            end += versesByBibleBook[book][i]
            if (avg >= start && avg <= end) {
                return i + 1
            }
            start = end
        }
    }
    const openRightPane = () => {
        store.setDistance(0, paneNumber)
        store.setIsRightPaneOpen(!store.getIsRightPaneOpen(paneNumber), paneNumber)
    }

    const onClick = (i) => {
        store.setCurrentItem(i, paneNumber)
        store.setDistance(i - gridVisibleRange.startIndex, paneNumber)
    }

    if (renderChapter === "1") {
        store.setHeaderChapter(calculateCurrentChapter(), paneNumber)

        chapterHtml = (
            <div className={classes.chapter}>
                <div className={classes.chapterNumber}>
                    <Typography className={classes.ch}>{lang === 'he' ? indoArabicToHebrew(chapter) : chapter}</Typography>
                    <hr/>
                </div>
                <div className={classes.references}>
                    <RefsBadge refsCount={0}/>
                </div>
            </div>)
    }
    const current = gridVisibleRange.startIndex + store.getDistance(paneNumber)
    const found = item === current

    //devLog(`chapter header item :${current}  distance:${store.getDistance(paneNumber)}`)

    useEffect(() => {
        store.setCommentsChapter(allBookData[current][BIBLE_CHAPTER], paneNumber)
        store.setCommentsVerse(allBookData[current][BIBLE_VERSE], paneNumber)
        store.setVerseData(allBookData[current], paneNumber)
    }, [allBookData,current,paneNumber,store])

    const ChapterBody = () => {
        switch (lang) {
            case 'en_he':
                return (
                    <>
                        <div className={classes.verseHe}>
                            <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                        </div>
                        <div className={classes.verseNumber}>
                            <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                        </div>
                        <div className={classes.verseEn}>
                            <Typography>{data[BIBLE_ENGLISH]}</Typography>
                        </div>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refs}/>
                        </div>
                    </>
                )
            case 'he':
                return (
                    <>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refs}/>
                        </div>
                        <div className={classes.verseHe}>
                            <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                        </div>

                        <div className={classes.verseNumber}>
                            <Typography className={classes.vn}>{indoArabicToHebrew(data[BIBLE_VERSE])}</Typography>
                        </div>
                    </>
                )
            case 'en':
                return (
                    <>
                        <div className={classes.verseNumber}>
                            <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                        </div>
                        <div className={classes.verseEn}>
                            <Typography>{data[BIBLE_ENGLISH]}</Typography>
                        </div>
                        <div className={classes.references}>
                            <RefsBadge refsCount={refs}/>
                        </div>
                    </>
                )
            default: {
              devLog(`Unknown language: ${lang}`)
            }
        }
    }
    return (
        <div className={classes.verse}>
            {chapterHtml}
            <div className={`${classes.textContainer} ${(found ? classes.selectVerse : '')}`}
                 onClick={onClick.bind(this, item)}
                 onDoubleClick={openRightPane.bind(this, item)}>
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
        // "&:hover": {
        //     background: Colors['verseOnMouseOver']
        // },
    },
    chapter: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
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
        textDecorationColor: Colors['underline'],
    },
    en: {
        fontSize: 22,
        textDecoration: 'underline',
        textDecorationColor: Colors['underline'],
    },
    ch: {
        fontSize: 18,
        color: Colors['gray'],
        direction: 'RTL',
        fontFamily: 'SBL Hebrew'
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
        color: Colors['gray']
    },
    verseHe: {
        maxWidth: ((props) => props.lang === 'he' ? '45%' : '35%'),
        minWidth: ((props) => props.lang === 'he' ? '45%' : '35%'),
        textAlign: 'right',
        verticalAlign: 'center',
        margin: 10,
        fontFamily: 'SBL Hebrew'
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
        color: Colors['gray'],
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
        margin: 10
    },
    hebrewFont: {
        direction: 'RTL',
        fontFamily: 'SBL Hebrew',
    },
    selectVerse: {
        backgroundColor: Colors['bibleSelectedVerse']
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