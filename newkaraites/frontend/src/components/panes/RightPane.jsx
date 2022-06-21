import React, {useContext, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Colors from '../../constants/colors'
import Button from '@material-ui/core/Button'
import {Paper, Typography} from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import {makeRandomKey} from '../../utils/utils'
import CommentsPane from '../comments/CommentPane'
import HalakhahPane from '../halakhah/HalakhahPane'
import {observer} from 'mobx-react-lite'
import Header from './header'
import {storeContext} from "../../stores/context";
import {referenceContext} from '../../stores/references/referenceContext'
import Container from "@material-ui/core/Container";
import {toJS} from "mobx";



const RightPane = ({paneNumber, refClick, openBook}) => {
    const store = useContext(storeContext)
    const reference = useContext(referenceContext)

    const [showState, setShowState] = useState(store.getRightPaneState(paneNumber))
    const verseData = (store.getVerseData(paneNumber).length === 0 ? ['', ''] : store.getVerseData(paneNumber))
    console.log(toJS(verseData))
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
        const lang = 'en'
        let index = 7
        if(lang === 'en') index = 8
        return reference.getLevels(lang).map(item => {
            index = index + 2
            return (
                <Button
                    variant="text"
                    className={classes.button}
                    fullWidth={true}
                    disabled={verseData[index] === '0'}
                    startIcon={<MenuBookIcon className={classes.icon}/>}
                    onClick={() => {
                        // setShowState([...showState, ])
                    }}
                    key={makeRandomKey()}
                >
                    {item} ({verseData[index]})
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
                    openBook={openBook}
                />)
            }
            default: {
                return (
                    <Container className={classes.container}>
                        <Header onClose={onClose}/>
                        <Paper className={classes.paper}>
                            <Typography className={classes.headerColor}>Related texts</Typography>
                            <hr className={classes.ruler}/>
                            <Item/>
                            <hr className={classes.ruler}/>
                        </Paper>
                    </Container>
                )
            }
        }
    }


    return (
        <Container className={classes.container}>
            <PaneBody/>
        </Container>
    )
}

export default observer(RightPane)


const useStyles = makeStyles((theme) => ({
    container: {
        height: '100%',
        top: 70,
        // backgroundColor: Colors['rightPaneBackGround']
        padding: 0,
    },
    paper: {
        height: '100%',
    },
    header: {
        minHeight: 50,
        // backgroundColor: Colors['headerBackgroundColor'],
    },
    body: {},
    ruler: {
        borderColor: Colors.rulerColor,
    },
    headerColor: {
        // color: Colors.leftPaneHeader,
        // marginTop: 20,
    },
    icon: {
        // color: Colors.leftPaneHeader,
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