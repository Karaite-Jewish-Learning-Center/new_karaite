import React, {useContext} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import {makeStyles} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {messageContext} from "../../stores/messages/messageContext";
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Message = () => {
    const messageStore = useContext(messageContext);
    const classes = useStyles();
    const {message, level, duration} = messageStore.getMessage()

    const handleClose = () => {
        messageStore.resetMessage()
    };

    return (
        <div className={classes.root}>
            <Snackbar
                open={message !== ''}
                autoHideDuration={duration}
                onClose={handleClose}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
                <Alert onClose={handleClose} severity={level}>
                    {message}
                </Alert>
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