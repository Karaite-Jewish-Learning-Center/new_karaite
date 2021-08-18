import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Colors from "../constants/colors";
import Typography from '@material-ui/core/Typography';
import {
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_RENDER_CHAPTER,
    BIBLE_EN_CM
} from "../constants/constants";
import CommentBadge from "./CommentBadge";
import ttSpeech from '../utils/ttspeech'
import store from '../stores/BibleStore';



export default function ChapterHeaderVerse(props) {
    const { item, data, highlight, bookUtils, onCommentOpen, paneNumber } = props
    let color = true
    let classes = useStyles()
    let chapterHtml = null
    let chapter = data[BIBLE_CHAPTER]
    let verse = data[BIBLE_VERSE]
    let renderChapter = data[BIBLE_RENDER_CHAPTER]

    const onDoubleClickEn = () => {
        ttSpeech(data[BIBLE_ENGLISH], 'en', 'Daniel', 1, 0.7)
    }

    const onDoubleClickHe = () => {
        ttSpeech(data[BIBLE_HEBREW], 'he-IL', 'Carmit', 1, 0.7)
    }
    const handleOnClick = (e) => {
        if (onCommentOpen === undefined || data[BIBLE_EN_CM] === '0') return
        onCommentOpen(paneNumber, chapter, verse)
    }

    if (renderChapter === "1") {

        store.updateChapter(chapter)
        
        chapterHtml = (<div className={classes.chapter}>
            <div className={classes.chapterNumber}>
                <Typography className={classes.ch}>{chapter}</Typography>
                <hr />
            </div>
            <div className={classes.comments}>
                <CommentBadge commentsCount={0}
                    sameChapterAndVerse={color}
                />
            </div>
        </div>)
    }
    return (
        <div>
            {chapterHtml}
            <div className={`${classes.textContainer} ${(highlight.indexOf(item + 1) >= 0 ? classes.selectVerse : '')}`}
                onClick={handleOnClick}
            // onClick={(onCommentOpen === undefined || data[BIBLE_EN_CM] === '0') ? null : onCommentOpen.bind(this, paneNumber, chapter, verse)}
            >
                <div className={classes.verseHe} onDoubleClick={onDoubleClickHe}>
                    <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>
                </div>

                <div className={classes.verseNumber}>
                    <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                </div>
                <div className={classes.verseEn} onDoubleClick={onDoubleClickEn}>
                    <Typography>{data[BIBLE_ENGLISH]}</Typography>
                </div>
                <div className={classes.comments}>
                    <CommentBadge commentsCount={data[BIBLE_EN_CM]}
                        sameChapterAndVerse={color}
                    />
                </div>
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
        "&:hover": {
            background: Colors['verseOnMouseOver']
        },
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
        direction: 'RTL',
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
        maxWidth: '35%',
        minWidth: '35%',
        textAlign: 'right',
        verticalAlign: 'text-top',
        margin: 10,
        fontFamily: 'SBL Hebrew'
    },
    verseNumber: {
        margin: 10,
        maxWidth: '5%',
        minWidth: '5%',
        textAlign: 'center',
        verticalAlign: 'text-top',
    },
    vn: {
        fontSize: 12,
        color: Colors['gray']
    },
    verseEn: {
        maxWidth: '35%',
        minWidth: '35%',
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
    comments: {
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
