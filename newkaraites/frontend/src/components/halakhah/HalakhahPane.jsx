import React, {useContext, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button'
import {referencesUrl} from '../../constants/constants.ts'
import {makeStyles} from '@material-ui/core/styles'
import {makeRandomKey} from "../../utils/utils";
import {Typography} from '@material-ui/core';
import Colors from '../../constants/colors.js';
import {observer} from 'mobx-react-lite';
import parse from 'html-react-parser'
import {TRANSFORM_TYPE} from '../../constants/constants'
import transform from "../../utils/transform";
import '../../css/_comments.css'
import '../../css/books.css'
import Header from '../pages/RightPaneHeader.jsx';
import {storeContext} from "../../stores/context";
import {messageContext} from "../../stores/messages/messageContext";
import {slug} from "../../utils/utils";
import {fetchData} from "../api/dataFetch";


const HalakhahPane = ({refClick, paneNumber, backButton, onClose, openBook}) => {
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const [references, setReferences] = useState([])
    const classes = useStyles()

    const callOpenBook = (index) => {
        openBook( paneNumber, slug(references[index]['book_name_en']), references[index]['paragraph_number'])
    }

    useEffect(() => {
        const url = referencesUrl + `${store.getBook(paneNumber)}/${store.getCommentsChapter(paneNumber)}/${store.getCommentsVerse(paneNumber)}/`
        fetchData(url)
            .then((data)=> {
                setReferences(data.references)
            })
            .catch((e)=> message.setMessage(e.message))


    }, [paneNumber, store])

    if ( references.length ) {
        return (
            <React.Fragment key={makeRandomKey()}>
                <Header backButton={backButton} onClose={onClose}/>
                <div className={classes.scroll}>
                    {references.map((reference,index) => (
                        <React.Fragment key={makeRandomKey()}>
                            <Typography className={classes.headerColor}>{reference['book_name']}</Typography>
                            <Typography className={classes.headerColor}>{reference['author']}</Typography>
                            <hr className={classes.ruler}/>
                            <div key={makeRandomKey()} className={classes.content}>
                                <>
                                    {parse(reference['paragraph_html'], {
                                        replace: domNode =>  transform(refClick, undefined, TRANSFORM_TYPE, paneNumber,domNode)
                                    })}
                                </>
                            </div>
                            <Button
                                className={classes.button}
                                onClick={callOpenBook.bind(this,index)}>Open book </Button>
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

