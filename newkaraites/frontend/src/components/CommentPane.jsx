import React, { useState } from "react";
import TabPanel from "./TabPanel";
import Comments from "./Comments";
import { makeStyles } from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CommentRef from "./commentsRef";
import { container } from "../constants/common-css";
import './css/comments.css'



const CommentsPane = ({ book, chapter, verse, comment, closeCommentTabHandler, refClick }) => {
    const [commentTab, setCommentTab] = useState(0)
    const classes = useStyles()


    if (comment.length === 0) return null

    const onTabChange = (event, tab) => {
        setCommentTab(tab)
    }

    return (
        <div className={classes.container}>
            <CommentRef book={book}
                chapter={chapter}
                verse={verse}
                language={commentTab}
                closeCommentTabHandler={closeCommentTabHandler}
                refClick={refClick}
            />
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
                    <Comments language="en" comments={comment} refClick={refClick} />
                </TabPanel>
                <TabPanel value={commentTab} index={1}>
                    <Comments language="he" comments={comment} refClick={refClick} />
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
        paddingBottom:20,
        
    },
    root: {
        marginBottom: 20,
    },
}));


export default CommentsPane