import React, {useContext, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import {Paper, Typography} from '@material-ui/core'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import {makeRandomKey, slug} from '../../utils/utils'
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
import Loading from "../general/loading";


const RightPane = ({paneNumber, refClick, openBook}) => {

    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const reference = useContext(referenceContext)
    // const [showState, setShowState] = useState(store.getRightPaneState(paneNumber))
    const [loading, setLoading] = useState(false)
    const [loadedBookChapterVerse, setLoadedBookChapterVerse] = useState('')
    const verseData = (store.getVerseData(paneNumber).length === 0 ? ['', ''] : store.getVerseData(paneNumber))
    const [languages, setLanguages] = useState(['en', 'he'])
    const [references, setReferences] = useState([])
    const [referenceKey, setReferenceKey] = useState('')

    const classes = useStyles()

    const onClick = () => {
        setLanguages([languages[1], languages[0]])
    }

    // const clickToOpen = (item, type, panNumber, e) => {
    //     store.setRightPaneState(showState, paneNumber)
    //     refClick(item, 'bible', paneNumber, e)
    // }

    const callOpenBook = (index) => {
        openBook(paneNumber, slug(references[index]['book_name_en']), references[index]['paragraph_number'])
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
        const bookChapterVerse = store.getBookChapterVerse(paneNumber)
        // already loaded do nothing
        if(bookChapterVerse === loadedBookChapterVerse && key === referenceKey) {
            setReferenceKey(key)
            return
        }

        setLoading(true)
        setLoadedBookChapterVerse(bookChapterVerse)

        // todo: try to fetch all references for this book chapter verse
        // maybe it's faster than fetching each reference separately
        // and easier to cache.

        fetchData(`${getBiblereferencesUrl}${bookChapterVerse}/${key}`)
            .then(data => {
                setReferences(data)
                setReferenceKey(key)
                setLoading(false)
            })
            .catch(e =>{
                message.setMessage('Error fetching references', e)
                setLoading(false)
            })

    }

    const ReferencesMenu = () => {
        if(loading) {
            return (
                <Container className={classes.container}>
                    <Loading />
                </Container>
            )
        }
        let index = 7
        if (languages[0] === 'en') index = 8
        const levels = reference.getLevelsNoTanakh()

        return Object.keys(levels).map(key => {
            index = index + 2
            if (languages[0] === 'en') {
                return (
                    <Container>
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
                    </Container>
                )
            } else {
                return (
                    <Container>
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
                    </Container>
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
        if (references.length === 0) {
            const message = (languages[0] === 'en' ? 'No references found' : 'לא נמצאו טקסטים')
            return (
                <Container className={classes.container}>
                    <Header backButton={backButton} onClose={onClose} onClick={onClick} language={languages[0]}/>
                    <Paper className={classes.paper}>
                        <Typography variant="h6"
                                    component="h2"
                                    className={(languages[0] === 'en' ? classes.messageEn : classes.messageHe)}>
                            {message}
                        </Typography>
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
                        // English
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
                                    <Button
                                        className={classes.openBookButton}
                                        onClick={callOpenBook.bind(this, 0)}>
                                        Open book
                                    </Button>
                                </>
                            )
                        }
                        // Hebrew
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
                                    <Button
                                        className={classes.openBookButton}
                                        onClick={callOpenBook.bind(this, 0)}>
                                        Open book
                                    </Button>
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
        textTransform: 'none',
        justifyContent: 'left',
    },
    buttonHe: {
        textTransform: 'none',
        justifyContent: 'right',
        direction: 'ltr',
    },
    openBookButton: {
        textTransform: 'none',
        marginBottom: theme.spacing(3),
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
    },
    messageEn: {
        paddingTop: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        direction: "ltr"
    },
    messageHe: {
        paddingTop: theme.spacing(3),
        paddingRight: theme.spacing(3),
        direction: "rtl"
    }
}));