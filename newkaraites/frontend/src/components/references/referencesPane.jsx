import React, {useContext, useEffect} from "react"
import {makeStyles} from '@material-ui/core/styles'
import Header from '../pages/RightPaneHeader';
import Container from '@material-ui/core/Container';
import {observer} from 'mobx-react-lite'
import {storeContext} from "../../stores/context";
import {messageContext} from "../../stores/messages/messageContext";
import {referenceContext} from '../../stores/references/referenceContext';
import {makeRandomKey} from "../../utils/utils";


const ReferencePane = ({paneNumber}) => {
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const reference = useContext(referenceContext)
    const classes = useStyles()


    return (

        <Container className={classes.container}>

        </Container>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        backgroundColor: 'red',
    },
    scroll: {
        height: '90vh',
        overflow: 'auto',
        paddingBottom: 20,
    },
    root: {
        marginBottom: 20,
    },
}));


export default observer(CommentsPane)