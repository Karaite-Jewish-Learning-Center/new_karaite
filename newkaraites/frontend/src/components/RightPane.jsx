import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../constants/colors'
import { Grid } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import { makeRandomKey } from '../utils/utils'
import CommentsPane from './CommentPane'
import HalakhahPane from './HalakhahPane'
import {
    BIBLE_EN_CM,
    BIBLE_REFS,
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
} from '../constants/constants'
import Player from './Player'
import store from '../stores/appState'
import { observer } from 'mobx-react-lite'



const items = ['Commentary', 'Halakhah']
const references = [BIBLE_EN_CM, BIBLE_REFS]



const RightPane = ({ paneNumber, refClick }) => {

    const [showState, setShowState] = useState([])
    const verseData = store.getVerseData(paneNumber)

    const classes = useStyles()

    const onClose = () => {
        store.setIsRightPaneOpen(false, paneNumber)
    }

    const backButton = () => {
        showState.pop()
        setShowState([...showState])
    }

    const Item = () => {
        return items.map((item, i) => {
            return (
                <Button
                    variant="text"
                    className={classes.button}
                    fullWidth={true}
                    disabled={verseData[references[i]] === '0'}
                    startIcon={<MenuBookIcon className={classes.icon} />}
                    onClick={() => { setShowState([...showState, i]) }}
                    key={makeRandomKey()}
                >
                    {item} ({verseData[references[i]]})
                </Button>
            )
        })
    }
    const Header = () => {
        return (
            <Grid container
                direction="row"
                justifycontent="flex-end"
                alignItems="center"
                className={classes.header}

            >
                <Grid item xs={10}>
                    {(showState.length > 0 ?
                        <IconButton
                            aria-label="Back"
                            component="span"
                            onClick={backButton}
                        >
                            <ChevronLeftIcon className={classes.iconGrid} />
                        </IconButton>
                        : null)}
                </Grid>
                <Grid item className={classes.icon}>
                    <IconButton
                        aria-label="Close pane"
                        component="span"
                        onClick={onClose}
                    >
                        <HighlightOffIcon className={classes.iconGrid} />
                    </IconButton>
                </Grid>
            </Grid>
        )
    }


    const PaneBody = () => {
        const show = showState.slice(-1)[0]
        switch (show) {
            case 0: {
                return (
                    <CommentsPane
                        refClick={refClick}
                        paneNumber={paneNumber}
                    />)
            }
            case 1: {
                return (<HalakhahPane
                    refClick={refClick}
                    paneNumber={paneNumber}
                />)
            }
            default: {
                return (

                    <div className={classes.body}>
                        <Typography className={classes.headerColor}>Related texts</Typography>
                        <hr className={classes.ruler} />
                        <Item />
                        <hr className={classes.ruler} />
                        <Player text={verseData[BIBLE_ENGLISH]} language={"English"} />
                        <Player text={verseData[BIBLE_HEBREW]} language={"Hebrew"} />

                    </div>
                )
            }
        }
    }

    console.log("Rendering Right pane ...", store.getIsRightPaneOpen(paneNumber))

    return (
        <div className={classes.container}>
            <Header />
            <PaneBody />
        </div>
    )
}

export default observer(RightPane)


const useStyles = makeStyles((theme) => ({
    container: {
        maxWidth: 400,
        height: '100%',
        top: 70,
        backgroundColor: Colors['rightPaneBackGround']
    },

    header: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
    body: {
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