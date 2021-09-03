import React, { useState } from 'react'
import { Grid } from '@material-ui/core';
import RenderText from './RenderText'
import RightPane from './RightPane';
import { makeStyles } from '@material-ui/core/styles'
import store from '../stores/appState';
import { observer } from 'mobx-react-lite';



const Bible = ({ paneNumber, refClick }) => {
    const classes = useStyles()

    const RenderRightPane = ({ isOpen }) => {
        if (isOpen) {
            return (
                <Grid item className={classes.rightPane}>
                    <RightPane
                        paneNumber={paneNumber}
                        refClick={refClick}
                    />
                </Grid>
            )
        }
        return null
    }

    return (
        <>
            <Grid item xs={true} className={classes.item} >
                <RenderText
                    paneNumber={paneNumber}
                />
            </Grid>
            <RenderRightPane isOpen={store.isRightPaneOpen} />
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        height: 'calc(95vh - 70px)',
        overflowY: 'hidden',
        position: 'fixed',
        top: 70,
    },
    item: {
        height: '100%'
    },
    rightPane: {
        maxWidth: '400 ! important',
    }
}));


export default observer(Bible)