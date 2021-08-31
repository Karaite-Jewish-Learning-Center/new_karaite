import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import RightPaneHeader from './RightPanelHeader'
import RightPaneBody from './RightPaneBody'
import Colors from '../constants/colors'

const RightPane = ({ back, close, rightPaneNumbers, showState, paneNumber, setPanesState, refClick }) => {

    const classes = useStyles()
    console.log("rendering Right Pane")
    return (
        <div className={classes.container}>
            <RightPaneHeader back={back} close={close} showState={showState} />
            <RightPaneBody
                rightPaneNumbers={rightPaneNumbers}
                showState={showState}
                paneNumber={paneNumber}
                setPanesState={setPanesState}
                refClick={refClick}
            />
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