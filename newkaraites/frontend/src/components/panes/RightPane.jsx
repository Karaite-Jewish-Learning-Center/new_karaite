import React, {useContext, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import {Paper, Typography} from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import {calculateItemNumber, makeRandomKey} from '../../utils/utils'
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
import {getBiblereferencesUrl, TRANSFORM_TYPE} from "../../constants/constants";
import parse from "html-react-parser";
import transform from "../../utils/transform";


const RightPane = ({paneNumber, refClick, openBook}) => {

    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const reference = useContext(referenceContext)
    const [showState, setShowState] = useState(store.getRightPaneState(paneNumber))

    const verseData = (store.getVerseData(paneNumber).length === 0 ? ['', ''] : store.getVerseData(paneNumber))
    const [languages, setLanguages] = useState(['en', 'he'])
    const [references, setReferences] = useState([])
    const [referenceKey, setReferenceKey] = useState('')

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
        setReferenceKey('')
    }

    const onClickReference = (key, _) => {
        fetchData(`${getBiblereferencesUrl}${store.getBookChapterVerse(paneNumber)}/${key}`)
            .then(data => {
                setReferences(data)
                debugger
                setReferenceKey(key)
            })
            .catch(e => message.setMessage('Error fetching references', e))
    }

    const ReferencesMenu = () => {
        let index = 7
        if (languages[0] === 'en') index = 8
        const levels = reference.getLevelsNoTanakh()

        return Object.keys(levels).map(key => {
            index = index + 2
            if (languages[0] === 'en') {
                return (
                    <Button
                        variant="text"
                        className={classes.button}
                        fullWidth={true}
                        disabled={verseData[index] === '0'}
                        startIcon={<MenuBookIcon className={classes.icon}/>}
                        onClick={onClickReference.bind(this, key)}
                        key={makeRandomKey()}>
                        <Typography variant="h6" component="h6" className={classes.itemsEn}>{levels[key][0]} ({verseData[index]})</Typography>
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
                        onClick={onClickReference.bind(this, key)}
                        key={makeRandomKey()}>
                        <Typography variant="h6" component="h6" className={classes.itemsHe}>({verseData[index]}){' '}{levels[key][1]} </Typography>
                    </Button>
                )
            }
        })
    }


    const PaneBody = () => {
        if (referenceKey === '') {
            return (
                <Container className={classes.container}>
                    <Header backButton={null} onClose={onClose} onClick={onClick} language={languages[0]}/>
                    <Paper className={classes.paper}>
                        <Typography variant="h6" component="h2" className={classes.related}>Related
                            texts</Typography>
                        <hr className={classes.ruler}/>
                        <ReferencesMenu/>
                        <hr className={classes.ruler}/>
                    </Paper>
                </Container>
            )
        }

        return (
            <Container className={classes.container}>
                <Header backButton={backButton} onClose={onClose} onClick={onClick} language={languages[0]}/>
                <Paper className={classes.paperRefs}>
                    {references.map(refs => {
                        if (languages[0] === 'en' && refs.paragraph_html[2] !== '') {
                            return (
                                <>
                                    <hr/>
                                    <Typography className={classes.title}>{refs.book_name_en}</Typography>
                                    <hr/>
                                    <Typography className={classes.author}>{refs.author}</Typography>
                                    <span className={classes.refs}>
                                        {parse(refs.paragraph_html[2], {
                                            replace: domNode => {
                                                return transform(refClick,
                                                    '',
                                                    TRANSFORM_TYPE,
                                                    paneNumber,
                                                    domNode)
                                            }
                                        })}
                                    </span>
                                </>
                            )
                        }
                        if (languages[0] === 'he' && refs.paragraph_html[1] !== '') {
                            return (
                                <>
                                    <hr/>
                                    <Typography className={classes.title_he}>{refs.book_name_he}</Typography>
                                    <hr/>
                                    <Typography className={classes.author_he}>{refs.author}</Typography>
                                    <span className={classes.refs}>
                                        {parse(refs.paragraph_html[0], {
                                            replace: domNode => {
                                                return transform(refClick,
                                                    '',
                                                    TRANSFORM_TYPE,
                                                    paneNumber,
                                                    domNode)
                                            }
                                        })}
                                    </span>
                                </>
                            )
                        }

                    })}

                </Paper>
            </Container>
        )
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
        top: 70,
        padding: 0,
        height: '100%',
    },
    paper: {
        height: '100%',
    },
    paperRefs: {
        padding: theme.spacing(2),
        overflow: 'auto',
        minHeight: '100%',
        maxHeight: '80vh',
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
        paddingLeft: theme.spacing(5),
        textTransform: 'none',
        justifyContent: 'left',
    },
    buttonHe: {
        paddingRight: theme.spacing(5),
        textTransform: 'none',
        justifyContent: 'right',
        direction: 'ltr',
    },
    itemsEn: {
        fontSize: 18,
        direction: 'rtl',
    },
    itemsHe: {
        fontSize: 18,
        direction: "ltr"
    },
    title: {
        fontSize: 16,
    },
    author: {
        fontSize: 14,
    },
    title_he: {
        fontSize: 16,
        direction: 'rtl',
        textAlign: 'right',
    },
    author_he: {
        fontSize: 14,
        direction: 'rtl',
        textAlign: 'right',
    },
    refs: {
        fontSize: 18,
    }
}));