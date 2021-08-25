import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import IconButton from '@material-ui/core/IconButton'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import Colors from '../constants/colors'
import CommentsPane from './CommentPane'
import {
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
    BIBLE_EN_CM,
    BIBLE_HE_CM,
    BIBLE_VERSE,
    BIBLE_CHAPTER,
    BIBLE_RENDER_CHAPTER,
    BIBLE_REFS
} from '../constants/constants'


const items = ['Commentary', 'Halakhah']
const references = [BIBLE_EN_CM, BIBLE_REFS]

const RightPaneBody = ({ rightPaneNumbers, showState, setShowState }) => {
    const [commentTab, setCommentTab] = useState(0)

    const verseData = rightPaneNumbers[0]
    const book = rightPaneNumbers[1]
    const classes = useStyles()
    debugger
    const Item = () => {
        return items.map((item, i) => {
            return (
                <>
                    <Button
                        variant="text"
                        className={classes.button}
                        fullWidth={true}
                        disabled={verseData[references[i]] === '0'}
                        startIcon={<MenuBookIcon className={classes.icon} />}
                        onClick={() => { setShowState(i) }}
                    >
                        {item} ({verseData[references[i]]})
                    </Button>
                </>
            )
        })
    }
    console.log("Rendering Right pane body..")
    if (verseData === undefined) return null

    switch (showState) {
        case 0: {
            return (
                <CommentsPane book={book}
                    chapter={verseData[BIBLE_CHAPTER]}
                    verse={verseData[BIBLE_VERSE]}
                    setShowState={setShowState}
                    commentTab={commentTab}
                    setCommentTab={setCommentTab}
                />)
        }
        case 1: {
            // show  halakhah
            break;
        }
        default: {
            return (

                <div className={classes.container}>
                    <Typography className={classes.headerColor}>Related texts</Typography>
                    <hr className={classes.ruler} />
                    <Item />
                    <Typography className={classes.headerColor}>Audio English</Typography>
                    <hr className={classes.ruler} />
                    <Typography className={classes.headerColor}>Audio Hebrew</Typography>
                    <hr className={classes.ruler} />
                    <div className={classes.root}>
                        <IconButton aria-label="play">
                            <PlayArrowIcon />
                        </IconButton>
                        <IconButton aria-label="pause" disabled>
                            <PauseIcon />
                        </IconButton>
                        <IconButton aria-label="stop" disabled>
                            <StopIcon />
                        </IconButton>

                    </div>
                </div>
            )
        }
    }
}



const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: 40,
        marginLeft: 30,
        marginRight: 30,
    },
    ruler: {
        borderColor: Colors.rulerColor,
    },
    headerColor: {
        color: Colors.leftPaneHeader,
        marginTop: 20,
    },
    icon: {
        color: Colors.leftPaneHeader,
        fontSize: 20,
    },
    text: {
        fontSize: 14,
    },
    button: {
        textTransform: 'none',
        justifyContent: 'left',
    },
}));


export default RightPaneBody