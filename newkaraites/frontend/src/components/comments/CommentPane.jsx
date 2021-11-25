import React, {useContext, useEffect} from "react"
import TabPanel from "../general/TabPanel"
import Comments from "./Comments"
import {getCommentsUrl} from '../../constants/constants'
import {makeStyles} from '@material-ui/core/styles'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import {observer} from 'mobx-react-lite'
import '../css/comments.css'
import Header from "../pages/RightPaneHeader"
import {storeContext} from "../../stores/context";
import {makeRandomKey} from "../../utils/utils";


const CommentsPane = ({refClick, paneNumber, backButton, onClose}) => {
    const store = useContext(storeContext)
    const classes = useStyles()


    useEffect(() => {
        const getComments = async (book, chapter, verse) => {
            const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
            return await response.json()
        }

        getComments(store.getBook(paneNumber),
            store.getCommentsChapter(paneNumber),
            store.getCommentsVerse(paneNumber))
            .then(data=>  store.setComments(data.comments, paneNumber))
            .catch((e)=> store.setMessage(e.message))

    }, [store, paneNumber])


    const onTabChange = (event, tab) => {
        store.setCommentTab(tab, paneNumber)
    }

    return (
        <React.Fragment key={makeRandomKey()}>
            <Header backButton={backButton} onClose={onClose}/>
            <Tabs
                className={classes.root}
                value={store.getCommentTab(paneNumber)}
                onChange={(onTabChange)}
                aria-label="comments English Hebrew">
                <Tab label="English" id={0} aria-label="Comments in English"/>
                <Tab label="Hebrew" id={1} aria-label="Comments in Hebrew"/>
            </Tabs>
            <div className={classes.scroll}>
                <TabPanel value={store.getCommentTab(paneNumber)} index={0}>
                    <Comments language="en" paneNumber={paneNumber} refClick={refClick}/>
                </TabPanel>
                <TabPanel value={store.getCommentTab(paneNumber)} index={1}>
                    <Comments language="he" paneNumber={paneNumber} refClick={refClick}/>
                </TabPanel>
            </div>
        </React.Fragment>
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