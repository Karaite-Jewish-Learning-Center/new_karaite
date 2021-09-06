import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import { referencesUrl } from '../constants/constants.js'
import { makeStyles } from '@material-ui/core/styles'
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom'
import Colors from '../constants/colors.js';
import store from '../stores/appState.js';
import { observer } from 'mobx-react-lite';
import './css/comments.css'



const HalakhahPane = ({ refClick, paneNumber }) => {
    const [showPane, setShowPane] = useState(null)
    const [current, setCurrent] = useState(null)
    const classes = useStyles()

    // todo refactor
    const transform = (node) => {

        if (node.type === 'tag') {
            // rewrite the span with a onClick event handler
            if (node.name === 'span') {
                if (node['attribs']['class'] === 'en-biblical-ref') {
                    return <span key={makeRandomKey()} lang="EN" onClick={refClick} className="en-biblical-ref">{node['children'][0]['data']}</span>
                }
                if (node['attribs']['class'] === 'he-biblical-ref') {
                    return <span key={makeRandomKey()} lang="HE" onClick={refClick} className="he-biblical-ref">{node['children'][0]['data']}</span>
                }
            }
            if (node.name === 'p') {
            }
        }
    }

    const onClick = (i) => {
        setShowPane(0)
        setCurrent(i)
    }
    const getHalakhah = async (book, chapter, verse) => {

        const response = await fetch(referencesUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            store.setReferences(data.references, paneNumber)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    const OpenBook = (book, chapter, verse) => <Link to={`/Halakhah/${book}/${chapter}/${verse}/`}>Open book</Link>

    useEffect(() => {
        getHalakhah(store.getBook(paneNumber), store.getCommentsChapter(paneNumber), store.getCommentsVerse(paneNumber))
    }, [])

    if (store.hasNoReferences(paneNumber)) return null

    switch (showPane) {
        case 0: {
            const references = store.getReferences(paneNumber)
            return (
                <div className={classes.container}>
                    <Typography className={classes.headerColor}>{references[current]['book_name']}</Typography>

                    <Typography className={classes.headerColor}>{references[current]['author']}</Typography>
                    <hr className={classes.ruler} />

                    <div key={makeRandomKey()}>
                        <>
                            {ReactHtmlParser(references[current]['paragraph_html'], {
                                decodeEntities: true,
                                transform: transform
                            })}
                        </>
                    </div>
                    <hr className={classes.ruler} />

                    <OpenBook />
                </div>

            )
        }
        default: {
            const references = store.getReferences(paneNumber)
            return (
                <div className={classes.container}>
                    <Typography className={classes.headerColor}>Halakhah ({references.length})</Typography>
                    <hr className={classes.ruler} />
                    <div key={makeRandomKey()}>
                        {references.map((obj, i) => (
                            <>
                                <Button
                                    variant="text"
                                    className={classes.button}
                                    fullWidth={true}
                                    onClick={onClick.bind(this, i)}
                                >
                                    {obj['book_name']}, {obj['author']}
                                </Button>
                                <hr className={classes.ruler} />
                            </>
                        ))}
                    </div>
                </div>

            )
        }
    }
}


export default observer(HalakhahPane)


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
    text: {
        fontSize: 14,
    },
    button: {
        textTransform: 'none',
        justifyContent: 'left',
    },
}));

