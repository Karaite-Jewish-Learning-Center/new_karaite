import React, { useEffect, useState } from 'react'
import { referencesUrl } from '../constants/constants.js'
import { makeStyles } from '@material-ui/core/styles'
import { makeRandomKey } from "../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import { Typography } from '@material-ui/core';
import Colors from '../constants/colors.js';

const BOOK_NAME = 0
const AUTHOR = 1
const LANGUAGE = 2
const PARA_NUMBER = 3
const PARA_HTML = 4
const REF_HE = 5
const FEF_EN = 6


const HalakhahPane = ({ book, chapter, verse }) => {
    const [references, setReferences] = useState([])

    const classes = useStyles()

    const transform = (node) => {

        if (node.type === 'tag') {
            // rewrite the span with a onClick event handler
            if (node.name === 'span') {
                if (node['attribs']['class'] === 'en-biblical-ref') {
                    return <span key={makeRandomKey()} lang="EN" onClick={() => { }} className="en-biblical-ref">{node['children'][0]['data']}</span>
                }
                if (node['attribs']['class'] === 'he-biblical-ref') {
                    return <span key={makeRandomKey()} lang="HE" onClick={() => { }} className="he-biblical-ref">{node['children'][0]['data']}</span>
                }
            }
            if (node.name === 'p') {
            }
        }
    }

    const getHalakhah = async (book, chapter, verse) => {

        const response = await fetch(referencesUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            debugger
            setReferences(data.references)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }
    useEffect(() => {
        getHalakhah(book, chapter, verse)
    }, [])

    if (referencesUrl.length === 0) return null

    return (
        <div className={classes.container}>
            <Typography className={classes.headerColor}>Halakhah ({references.length})</Typography>
            <hr className={classes.ruler} />


            <div key={makeRandomKey()}>
                {references.map(obj => (
                    <>
                        <Typography className={classes.text} >{obj['book_name']},{obj['author']}</Typography>
                        <hr className={classes.ruler} />
                    </>
                ))}
            </div>
        </div>
    )
}

export default HalakhahPane

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
}));

