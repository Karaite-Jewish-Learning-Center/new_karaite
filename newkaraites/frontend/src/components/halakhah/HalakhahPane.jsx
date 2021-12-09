import React, {useContext, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button'
import {referencesUrl} from '../../constants/constants.ts'
import {makeStyles} from '@material-ui/core/styles'
import {makeRandomKey} from "../../utils/utils";
import ReactHtmlParser from 'react-html-parser';
import {Typography} from '@material-ui/core';
import Colors from '../../constants/colors.js';
import {observer} from 'mobx-react-lite';
import transform from '../../utils/transform.jsx'
import '../../css/_comments.css'
import '../../css/karaites.css'
import Header from '../pages/RightPaneHeader.jsx';
import {storeContext} from "../../stores/context";


const HalakhahPane = ({refClick, paneNumber, backButton, onClose}) => {
    const store = useContext(storeContext)
    const [references, setReferences] = useState([])
    const classes = useStyles()


    useEffect(() => {
        const getHalakhah = async (book, chapter, verse) => {
            const response = await fetch(referencesUrl + `${book}/${chapter}/${verse}/`)
                return  await response.json()
        }

        getHalakhah(store.getBook(paneNumber), store.getCommentsChapter(paneNumber), store.getCommentsVerse(paneNumber))
            .then((data)=>setReferences(data.replace))
            .catch((e)=> store.setMessage(e.message))


    }, [paneNumber, store])

    if (references.length !== 0) {
        return (
            <React.Fragment key={makeRandomKey()}>
                <Header backButton={backButton} onClose={onClose}/>
                <div className={classes.scroll}>
                    {references.map((reference) => (
                        <React.Fragment key={makeRandomKey()}>
                            <Typography className={classes.headerColor}>{reference['book_name']}</Typography>
                            <Typography className={classes.headerColor}>{reference['author']}</Typography>
                            <hr className={classes.ruler}/>
                            <div key={makeRandomKey()} className={classes.content}>
                                <>
                                    {ReactHtmlParser(reference['paragraph_html'], {
                                        decodeEntities: true,
                                        transform: transform.bind(this, refClick, undefined, "bible", undefined)
                                    })}
                                </>
                            </div>
                            <Button
                                className={classes.button}
                                onClick={() => {
                                }}
                            >Open book </Button>
                            <hr className={classes.ruler}/>

                        </React.Fragment>
                    ))}
                </div>
            </React.Fragment>
        )
    } else {
        return (
            <>
                <Header backButton={backButton} onClose={onClose}/>
                <Typography className={classes.no}>No references</Typography>
            </>
        )
    }
}


export default observer(HalakhahPane)


const useStyles = makeStyles((theme) => ({

    ruler: {
        borderColor: Colors.rulerColor,
        marginTop: 20,
        marginLeft: 15,
        marginRight: 15,

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
    no: {
        marginTop: 20,
        marginLeft: 50,
    },
}));

