import React, {useContext} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Grid } from '@material-ui/core'
import { unslug } from '../../utils/utils'
import Colors from '../../constants/colors'
import { observer } from 'mobx-react-lite'
import {storeContext} from '../../stores/context'
import {CloseButton} from "../buttons/CloseButton";


const KaraitesPaneHeader = ({ paneNumber, onClosePane}) => {
    const store= useContext(storeContext)
    const classes = resources()

   const onClose =()=> {
        onClosePane(paneNumber)
   }

    return (
        <Grid container
            direction="row"
            className={classes.resources}
            alignItems="center">
            <Grid item xs={true}>
                <CloseButton onClick={onClose}/>
            </Grid>
            <Grid item xs={true}>
                <Typography>{unslug(store.getBook(paneNumber))}</Typography>
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