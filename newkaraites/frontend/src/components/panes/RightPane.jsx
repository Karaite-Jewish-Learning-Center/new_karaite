import React, {useContext, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import {Paper, Typography} from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import {makeRandomKey} from '../../utils/utils'
import CommentsPane from '../comments/CommentPane'
import HalakhahPane from '../halakhah/HalakhahPane'
import {observer} from 'mobx-react-lite'
import Header from './header'
import {storeContext} from "../../stores/context";
import {messageContext} from "../../stores/messages/messageContext";
import {referenceContext} from '../../stores/references/referenceContext'
import Container from "@material-ui/core/Container";
import {toJS} from "mobx";
import {fetchData} from "../api/dataFetch";
import {getBiblereferencesUrl} from "../../constants/constants";


const RightPane = ({paneNumber, refClick, openBook}) => {

    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const reference = useContext(referenceContext)
    const [showState, setShowState] = useState(store.getRightPaneState(paneNumber))
    const verseData = (store.getVerseData(paneNumber).length === 0 ? ['', ''] : store.getVerseData(paneNumber))
    const [languages, setLanguages] = useState(['en', 'he'])
    const [references, setReferences] = useState([])

    const classes = useStyles()

    const onClick = () => {
        setLanguages([languages[1], languages[0]])
    }

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

    const onClickReference = (key, _) => {
        fetchData(`${getBiblereferencesUrl}${store.getBookChapterVerse(paneNumber)}/${key}`)
            .then(data => setReferences(data))
            .catch(message.setMessage('Error fetching references'))
    }

    const Item = () => {
        let index = 4
        let langIndex = 1
        if (languages[0] === 'en') {
            index = 5
            langIndex = 0
        }
        const levels = reference.getLevelsNoTanakh()

        return Object.keys(levels).map(key => {
            index = index + 2
            if (langIndex === 0) {
                return (
                    <Button
                        variant="text"
                        className={classes.button}
                        fullWidth={true}
                        disabled={verseData[index] === '0'}
                        startIcon={<MenuBookIcon className={classes.icon}/>}
                        onClick={onClickReference.bind(this, key)}
                        key={makeRandomKey()}>
                        <Typography variant="h6" component="h6" className={classes.itemsEn}>{levels[key][langIndex]} ({verseData[index]})</Typography>

                    </Button>
                )
            } else {
                return (
                    <Button
                        variant="text"
                        className={classes.buttonHe}
                        fullWidth={true}
                        disabled={verseData[index] === '0'}
                        endIcon={<MenuBookIcon className={classes.icon}/>}
                        onClick={() => {
                            // setShowState([...showState, ])
                        }}
                        key={makeRandomKey()}>
                        <Typography variant="h6" component="h6" className={classes.itemsHe}>({verseData[index]}){' '}{levels[key][langIndex]} </Typography>

                    </Button>

                )
            }
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
                        <Header backButton={backButton} onClose={onClose} onClick={onClick} language={languages[0]}/>
                        <Paper className={classes.paper}>
                            <Typography variant="h6" component="h2" className={classes.related}>Related
                                texts</Typography>
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
        padding: 0,
    },
    paper: {
        height: '100%',
    },
    header: {
        minHeight: 50,
    },
    related: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
    },
    ruler: {
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    icon: {
        fontSize: 20,
    },
    text: {
        fontSize: 14,
    },
    button: {
        textTransform: 'none',
        justifyContent: 'left',
        paddingLeft: theme.spacing(4),
    },
    buttonHe: {
        textTransform: 'none',
        justifyContent: 'right',
        paddingRight: theme.spacing(4),
        direction: 'ltr',
    },
    itemsEn: {
        paddingLeft: 2,
        fontSize: 18,
        direction: 'rtl',
    },
    itemsHe: {
        paddingLeft: 2,
        fontSize: 18,
        direction: "ltr"
    }

}));