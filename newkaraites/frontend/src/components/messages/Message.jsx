import React, {useContext} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import {makeStyles} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {storeContext} from "../../stores/context";
import {CloseButton} from "../buttons/CloseButton";


const Message = ({hide = 4000}) => {
    const store = useContext(storeContext)
    const classes = useStyles();

    const handleClose = () => {
        store.setMessage('')
    };

    return (
        <div className={classes.root}>
            <Snackbar
                open={store.getMessage() !== ''}
                autoHideDuration={hide}
                onClose={handleClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                message={<span id="message-id">{store.getMessage()}</span>}
                action={<CloseButton onClick={handleClose} color="inherit"/>}>
            </Snackbar>
        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        '& > * + *': {
            marginTop: theme.spacing(20),
        },
    },
    close: {
        padding: theme.spacing(0.5),
    },

}));

export default observer(Message)