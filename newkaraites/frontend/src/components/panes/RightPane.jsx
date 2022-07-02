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
import {getBibleReferencesUrl, TRANSFORM_TYPE} from "../../constants/constants";
import parse from "html-react-parser";
import transform from "../../utils/transform";
import Loading from "../general/loading";

const COUNT_HE = 9
const COUNT_EN = 10


const RightPane = ({paneNumber, refClick, openBook}) => {

    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const reference = useContext(referenceContext)
    const [loading, setLoading] = useState(false)
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
        // todo: cache the references
        setLoading(true)

        fetchData(`${getBibleReferencesUrl}${bookChapterVerse}/`)
            .then(data => {
                setReferences(data)
                setReferenceKey(key)
                setLoading(false)
            })
            .catch(e => {
                message.setMessage('Error fetching references', e)
                setLoading(false)
            })

    }

    const ReferencesMenu = () => {

        if (loading || verseData.length === 2 || verseData[COUNT_HE] === undefined) {
            return (
                <Container className={classes.container}>
                    <Loading/>
                </Container>
            )
        }

        const levels = reference.getLevelsNoTanakh()
        const langIndex = (languages[0] === 'en' ? 0 : 1)
        let counts = [JSON.parse(verseData[COUNT_EN]), JSON.parse(verseData[COUNT_HE])]
        return Object.keys(levels).map((key, index) => {
            return (
                <Container key={makeRandomKey()}>
                    <Button
                        variant="text"
                        className={(langIndex === 0 ? classes.button : classes.buttonHe)}
                        fullWidth={true}
                        disabled={counts[langIndex][index] === 0}
                        startIcon={<MenuBookIcon className={classes.icon}/>}
                        onClick={onClickReference.bind(this, key)}
                        key={makeRandomKey()}>
                        {langIndex === 0 ?
                            <Typography variant="h6" component="h6" className={classes.itemsEn}>{levels[key][0]} ({counts[langIndex][index]})</Typography>
                            :
                            <Typography variant="h6" component="h6" className={classes.itemsHe}>({counts[langIndex][index]}){' '}{levels[key][1]} </Typography>
                        }
                    </Button>
                </Container>
            )
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
        // Judeo-Arabic is also 2
        const index = (languages[0] === 'en' ? 0 : 2)
        return (
            <Container className={classes.container}>
                <Header backButton={backButton} onClose={onClose} onClick={onClick} language={languages[0]}/>
                <Paper className={classes.paperRefs}>
                    {references.map(refs => {
                        if (refs.book_first_level === referenceKey && refs.paragraph_html[index] !== '') {
                            return (
                                <>
                                    <hr/>
                                    <Typography className={classes.title}>{refs.book_name_en}</Typography>
                                    <hr/>
                                    <Typography className={classes.author}>{refs.author}</Typography>
                                    <span className={classes.refs}>
                                        {parse(refs.paragraph_html[index], {
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