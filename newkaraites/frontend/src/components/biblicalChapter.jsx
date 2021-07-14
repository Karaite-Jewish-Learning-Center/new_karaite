import React from 'react'
import {makeStyles} from '@material-ui/core/styles';
import Colors from "../constants/colors";
import Typography from '@material-ui/core/Typography';
import {
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_EN_CM,
    BIBLE_HE_CM,

} from "../constants/constants";
import {equals} from "../utils/utils";
import CommentBadge from "./CommentBadge";
import Speech from 'react-speech';
import BibleBottomNavigation from "./BottomNavigate";
import MoreVertIcon from '@material-ui/icons/MoreVert';

export default function ChapterHeaderVerse(props) {
    const {item, data, highlight, bookData} = props
    debugger
    let classes = useStyles()
    let chapterHtml = null
    let chapter = data[BIBLE_CHAPTER]
    if (chapter !== "0") {
        if (chapter === "1") {
            chapterHtml = (<div className={classes.chapter}>
                <div className={classes.chapterTitle_he}>
                    <Typography className={`${classes.he} ${classes.hebrewFont}`}>{bookData.book_title_he}</Typography>
                </div>
                <div className={classes.chapterNumber}>
                    <Typography className={classes.ch}>{chapter}</Typography>
                </div>
                <div className={classes.chapterTitle_en}>
                    <Typography className={classes.en}>{bookData.book_title_en}</Typography>
                </div>

            </div>)
        } else {
            chapterHtml = (<div className={classes.chapter}>
                <div className={classes.chapterNumber}>
                    <Typography className={classes.ch}>{chapter}</Typography>
                    <hr/>
                </div>
            </div>)
        }
    }
    return (
        <div>
            {chapterHtml}
            <div className={`${classes.textContainer} ${( highlight.indexOf(item+1) >=0 ? classes.selectVerse : '')}`}>
                <div className={classes.verseHe}>
                    <Typography className={classes.hebrewFont}>{data[BIBLE_HEBREW]}</Typography>

                </div>
                 <MoreVertIcon/>
                <div className={classes.verseNumber}>
                    <Typography className={classes.vn}>{data[BIBLE_VERSE]}</Typography>
                </div>
                <div className={classes.verseEn}>
                    <Typography>{data[BIBLE_ENGLISH]}</Typography>
                </div>

                {/*<div className={classes.comments}>*/}
                {/*    <CommentBadge commentsCount={1} sameChapterAndVerse={false}/>*/}
                {/*</div>*/}
            </div>
            {/*<div className={`${classes.textContainer} ${(highlight === item ? classes.selectVerse : '')}`}>*/}
            {/*    <div className={classes.verseHe}>*/}
            {/*        <CommentBadge commentsCount={1} sameChapterAndVerse={false}/>*/}
            {/*        <Speech text={data[BIBLE_HEBREW]}*/}
            {/*                lang="he-IL"*/}
            {/*                voice="Carmit"*/}
            {/*                rate={0.7}*/}
            {/*            // stop={true}*/}
            {/*            // pause={true}*/}
            {/*            // resume={true}*/}
            {/*                style={style.play}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*    <div className={classes.verseNumber}></div>*/}
            {/*    <div className={classes.verseEn}>*/}
            {/*        <CommentBadge commentsCount={8} sameChapterAndVerse={false}/>*/}
            {/*    </div>*/}
            {/*</div>*/}
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
        maxWidth: '40%',
        minWidth: '40%',
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
        maxWidth: '40%',
        minWidth: '40%',
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
        maxWidth: '40%',
        minWidth: '40%',
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
        maxWidth: '40%',
        minWidth: '40%',
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
    },
}))

const style = {
    container: {},
    text: {},
    buttons: {},
    play: {
        hover: {
            backgroundColor: 'GhostWhite'
        },
        button: {
            width: '28',
            height: '28',
            cursor: 'pointer',
            pointerEvents: 'none',
            outline: 'none',
            backgroundColor: 'yellow',
            border: 'solid 1px rgba(255,255,255,1)',
            borderRadius: 6
        },
    },
    pause: {
        play: {},
        hover: {},
    },
    stop: {
        play: {},
        hover: {},
        button: {},
    },
    resume: {
        play: {
            hover: {},
            button: {}
        },
    }
}
