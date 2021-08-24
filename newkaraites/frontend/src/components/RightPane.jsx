import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import RightPaneHeader from './RightPanelHeader'
import RightPaneBody from './RightPaneBody'
import Colors from '../constants/colors'

const RightPane = ({ close, rightPaneNumbers }) => {

    const classes = useStyles()

    return (
        <div className={classes.container}>
            <RightPaneHeader close={close} />
            <RightPaneBody rightPaneNumbers={rightPaneNumbers} />
        </div>
    )

}

export default RightPane


const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        top: 70,
        backgroundColor: Colors['rightPaneBackGround']
    },

}));