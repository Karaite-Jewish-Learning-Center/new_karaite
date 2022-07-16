import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {storeContext} from '../../stores/context'
import {observer} from 'mobx-react-lite';
import './spin.css'

const LoadingSpin = () => {
    const store = useContext(storeContext)
    const classes = useStyles()
    if (store.getLoading()) {
        return (
            <div className={classes.container}>
                <div className={'spin'}></div>
            </div>
        )
    }
    return null
}

const useStyles = makeStyles(() => ({
    container: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        margin: 'auto',
    },

}))

export default observer(LoadingSpin)