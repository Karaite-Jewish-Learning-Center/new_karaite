import React, { useState, useEffect } from "react"
import TabPanel from "./TabPanel"
import Comments from "./Comments"
import { getCommentsUrl } from '../constants/constants'
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import './css/comments.css'


const CommentsPane = ({ book, chapter, verse, refClick, commentTab, setCommentTab }) => {
    const [comments, setComments] = useState([])
    const classes = useStyles()

    const getComments = async (book, chapter, verse) => {

        const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
        if (response.ok) {
            const data = await response.json()
            setComments(data.comments)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }


    useEffect(() => {
        getComments(book, chapter, verse, [])
    }, [])

    if (comments.length === 0) return null

    const onTabChange = (event, tab) => {
        setCommentTab(tab)
    }
    console.log('rendering Comment pane')
    return (
        <div className={classes.container}>
            <Tabs
                className={classes.root}
                value={commentTab}
                onChange={onTabChange}
                aria-label="comments English Hebrew">
                <Tab label="English" id={0} aria-label="Comments in English" />
                <Tab label="Hebrew" id={1} aria-label="Comments in Hebrew" />
            </Tabs>
            <div className={classes.scroll}>
                <TabPanel value={commentTab} index={0}>
                    <Comments language="en" comments={comments} refClick={refClick} />
                </TabPanel>
                <TabPanel value={commentTab} index={1}>
                    <Comments language="he" comments={comments} refClick={refClick} />
                </TabPanel>
            </div>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        width: 'auto',
        position: 'fixed',

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


export default CommentsPane