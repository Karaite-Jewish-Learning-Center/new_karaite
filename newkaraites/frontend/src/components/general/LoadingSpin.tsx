import React, {useContext} from 'react';
import ReactLoading from 'react-loading';
import {makeStyles} from '@material-ui/core/styles';
import Colors from '../../constants/colors'
import {storeContext} from '../../stores/context'
import {observer} from 'mobx-react-lite';

const LoadingSpin = ({color, type}: { color: any, type: any }) => {
    const store = useContext(storeContext)
    const classes = useStyles()
    if (store.getLoading()) {
        return (
            <div className={classes.container}>
                <ReactLoading type={type} color={color} height={30} width={30}/>
            </div>
        )
    }
    return null
}

LoadingSpin.defaultProps = {
    color: Colors.loading,
    type: 'spin'
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