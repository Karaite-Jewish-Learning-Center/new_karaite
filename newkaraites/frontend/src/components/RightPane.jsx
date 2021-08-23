import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import RightPaneHeader from './RightPanelHeader'



const RightPane = ({ close, commentsNumber }) => {

    const classes = useStyles()

    return (
        <div className={classes.container}>
            <RightPaneHeader close={close} />
            <p>Comments :{commentsNumber}</p>
        </div>
    )

}

export default RightPane


const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        top: 70,
        backgroundColor: 'red'
    },

}));