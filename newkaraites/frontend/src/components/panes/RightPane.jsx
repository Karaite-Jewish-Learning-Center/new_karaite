import React, {useContext, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Colors from '../../constants/colors'
import Button from '@material-ui/core/Button'
import {Typography} from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import {makeRandomKey} from '../../utils/utils'
import CommentsPane from '../comments/CommentPane'
import HalakhahPane from '../halakhah/HalakhahPane'
import {
    BIBLE_EN_CM,
    BIBLE_REFS,
    BIBLE_ENGLISH,
    BIBLE_HEBREW,
} from '../../constants/constants'
import Player from '../player/Player'
import {observer} from 'mobx-react-lite'
import Header from '../pages/RightPaneHeader'
import {storeContext} from "../../stores/context";

const items = ['Commentary', 'Halakhah']
const references = [BIBLE_EN_CM, BIBLE_REFS]


const RightPane = ({paneNumber, refClick}) => {
    const store = useContext(storeContext)

    const [showState, setShowState] = useState(store.getRightPaneState(paneNumber))
    const verseData = (store.getVerseData(paneNumber).length === 0 ? ['',''] : store.getVerseData(paneNumber))

    const classes = useStyles()

    const clickToOpen = (item, type, panNumber, e) => {
        store.setRightPaneState(showState, paneNumber)
        refClick(item, 'bible', paneNumber, e)
    }

    const onClose = () => {
        store.setDistance(0, paneNumber)
        store.setRightPaneState([], paneNumber)
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
                    startIcon={<MenuBookIcon className={classes.icon}/>}
                    onClick={() => {
                        setShowState([...showState, i])
                    }}
                    key={makeRandomKey()}
                >
                    {item} ({verseData[references[i]]})
                </Button>
            )
        })
    }

    const PaneBody = () => {
        const show = showState.slice(-1)[0]
        switch (show) {
            case 0: {
                return (
                    <CommentsPane
                        refClick={clickToOpen}
                        paneNumber={paneNumber}
                        backButton={backButton}
                        onClose={onClose}
                    />)
            }
            case 1: {
                return (<HalakhahPane
                    refClick={clickToOpen}
                    paneNumber={paneNumber}
                    backButton={backButton}
                    onClose={onClose}

                />)
            }
            default: {
                return (
                    <>
                        <Header onClose={onClose}/>
                        <div className={classes.body}>
                            <Typography className={classes.headerColor}>Related texts</Typography>
                            <hr className={classes.ruler}/>
                            <Item/>
                            <hr className={classes.ruler}/>
                            <Player text={verseData[BIBLE_ENGLISH]} language={"English"}/>
                            <Player text={verseData[BIBLE_HEBREW]} language={"Hebrew"}/>
                        </div>
                    </>
                )
            }
        }
    }


    return (
        <div className={classes.container}>
            <PaneBody/>
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