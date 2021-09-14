import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import { referencesUrl } from '../constants/constants.js'
import { makeStyles } from '@material-ui/core/styles'
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import { Typography } from '@material-ui/core';
import Colors from '../constants/colors.js';
import store from '../stores/appState.js';
import { observer } from 'mobx-react-lite';
import { slug } from '../utils/utils';
import transform from '../utils/transform.jsx'
import './css/comments.css'
import Header from './RightPaneHeader.jsx';



const HalakhahPane = ({ refClick, paneNumber, backButton, onClose }) => {
    const [showPane, setShowPane] = useState(1)
    const [references, setReferences] = useState([])
    const [current, setCurrent] = useState(null)
    const classes = useStyles()

    const back = () => {
        if (showPane === 0) {
            setShowPane(1)
        } else {
            backButton()
        }
    }
    const buttonOnClick = () => {

        store.setPanes({
            book: slug(references[current]['book_name']),
            chapter: references[current]['paragraph_number'],
            verse: 1,
            paragraphs: [],
            book_details: [],
            highlight: [],
            type: 'karaites'
        })

    }
    const onClick = (i) => {
        setShowPane(0)
        setCurrent(i)
    }
    const getHalakhah = async (book, chapter, verse) => {

        const response = await fetch(referencesUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            setReferences(data.references)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }


    useEffect(() => {
        getHalakhah(store.getBook(paneNumber), store.getCommentsChapter(paneNumber), store.getCommentsVerse(paneNumber))
    }, [])

    switch (showPane) {
        case 0: {
            return (
                <>
                    <Header backButton={back} onClose={onClose} />
                    <div className={classes.container}>
                        <Typography className={classes.headerColor}>{references[current]['book_name']}</Typography>

                        <Typography className={classes.headerColor}>{references[current]['author']}</Typography>
                        <hr className={classes.ruler} />
                        <div className={classes.scroll}>
                            <div key={makeRandomKey()} className={classes.content}>
                                <>
                                    {ReactHtmlParser(references[current]['paragraph_html'], {
                                        decodeEntities: true,
                                        transform: transform.bind(this, refClick)
                                    })}
                                </>
                            </div>
                            <hr className={classes.ruler} />
                            <Button
                                className={classes.button}
                                onClick={buttonOnClick}
                            >Open book</Button>

                        </div>
                    </div>
                </>
            )
        }
        default: {
            return (
                <>
                    <Header backButton={backButton} onClose={onClose} />
                    <div className={classes.container}>
                        <Typography className={classes.headerColor}>Halakhah ({references.length})</Typography>
                        <hr className={classes.ruler} />
                        <div key={makeRandomKey()}>
                            {references.map((obj, i) => (
                                <>
                                    <Button
                                        variant="text"
                                        className={classes.button}
                                        fullWidth={false}
                                        onClick={onClick.bind(this, i)}
                                    >
                                        {obj['book_name']}, {obj['author']}
                                    </Button>
                                    <hr className={classes.ruler} />
                                </>
                            ))}
                        </div>
                    </div>
                </>
            )
        }
    }
}


export default observer(HalakhahPane)


const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        maxWidth: '400px !important',
    },
    ruler: {
        borderColor: Colors.rulerColor,
        marginTop: 20,
        marginLeft: 15,
        marginRight: 15,

    },
    ruler1: {
        borderColor: Colors.rulerColor,
        marginTop: 20,
    },
    headerColor: {
        color: Colors.leftPaneHeader,
        marginTop: 20,
        marginLeft: 15

    },
    text: {
        fontSize: 14,
    },
    button: {
        textTransform: 'none',
        justifyContent: 'left',
        paddingRight: 15,
        paddingLeft: 15,
    },
    scroll: {
        width: '100%',
        height: '70vh',
        overflow: 'auto',
    },
    content: {
        margin: 15,
    },
}));

