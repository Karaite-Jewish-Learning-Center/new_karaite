import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import RightPaneHeader from './RightPanelHeader'
import RightPaneBody from './RightPaneBody'
import Colors from '../constants/colors'

const RightPane = ({ close, rightPaneNumbers, showState, setShowState }) => {

    const classes = useStyles()
    console.log("rendering Right Pane")
    return (
        <div className={classes.container}>
            <RightPaneHeader close={close} />
            <RightPaneBody
                rightPaneNumbers={rightPaneNumbers}
                showState={showState}
                setShowState={setShowState} />
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