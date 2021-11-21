import React, {useContext} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import { Grid } from '@material-ui/core'
import { unslug } from '../../utils/utils'
import Colors from '../../constants/colors'
import { observer } from 'mobx-react-lite'
import {storeContext} from '../../stores/context'


const KaraitesPaneHeader = ({ paneNumber }) => {
    const store= useContext(storeContext)
    const classes = resources()

    const onClosePane = () => {
        store.closePane(paneNumber)
        if (store.getPanes.length === 0) {
            store.setIsLastPane(true)
        }
    }

    return (
        <Grid container
            direction="row"
            className={classes.resources}
            alignItems="center"
        >

            <Grid item xs={true}>
                <IconButton className={classes.iconButton}
                    aria-label="Close comments pane"
                    component="span"
                    onClick={onClosePane}
                >
                    <CloseIcon className={classes.iconGrid} />
                </IconButton>
            </Grid>
            <Grid item xs={true}>
                <Typography>{unslug(store.getBook(paneNumber))}, </Typography>
            </Grid>
            <Grid item xs={true}></Grid>
        </Grid>
    )
}

const resources = makeStyles({
    resources: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
        padding: 0,
        marginRight: 0,
    },
    iconGrid: {
        margin: 0,
        padding: 0,

    },
    iconButton: {
        marginRight: 12
    }

})
export default observer(KaraitesPaneHeader)