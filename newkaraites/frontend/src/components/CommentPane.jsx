import React, { useEffect } from "react"
import TabPanel from "./TabPanel"
import Comments from "./Comments"
import { getCommentsUrl } from '../constants/constants'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import store from "../stores/appState"
import { observer } from 'mobx-react-lite'
import './css/comments.css'
import Header from "./RightPaneHeader"


const CommentsPane = ({ refClick, paneNumber, backButton, onClose }) => {
    const classes = useStyles()

    const getComments = async (book, chapter, verse) => {
        //todo , why this all ways false, loading 3 time same comment 
        console.log("need update", store.needUpdateComment(chapter, verse, paneNumber))

        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            store.setComments(data.comments, paneNumber)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getComments(store.getBook(paneNumber), store.getCommentsChapter(paneNumber), store.getCommentsVerse(paneNumber))
    }, [])

    // if (store.hasNoComments(paneNumber)) return null

    const onTabChange = (event, tab) => {
        store.setCommentTab(tab, paneNumber)
    }

    return (
        <>
            <Header backButton={backButton} onClose={onClose} />
            <Tabs
                className={classes.root}
                value={store.getCommentTab(paneNumber)}
                onChange={(onTabChange)}
                aria-label="comments English Hebrew">
                <Tab label="English" id={0} aria-label="Comments in English" />
                <Tab label="Hebrew" id={1} aria-label="Comments in Hebrew" />
            </Tabs>
            <div className={classes.scroll}>
                <TabPanel value={store.getCommentTab(paneNumber)} index={0}>
                    <Comments language="en" comments={store.getComments(paneNumber)} refClick={refClick} />
                </TabPanel>
                <TabPanel value={store.getCommentTab(paneNumber)} index={1}>
                    <Comments language="he" comments={store.getComments(paneNumber)} refClick={refClick} />
                </TabPanel>
            </div>
        </>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        maxWidth: '400px !important',

    },
    scroll: {
        height: '70vh',
        overflow: 'auto',
        paddingRight: 10,
        paddingBottom: 20,
    },
    root: {
        marginBottom: 20,
    },
}));


export default observer(CommentsPane)