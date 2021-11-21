import React, {useContext} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {storeContext} from "../../stores/context";


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
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                message={<span id="message-id">{store.getMessage()}</span>}
                action={[

                    <IconButton
                        key="close"
                        aria-label="close"
                        color="inherit"
                        className={classes.close}
                        onClick={handleClose}
                    >
                        <CloseIcon/>
                    </IconButton>,
                ]}
            >
            </Snackbar>

        </div>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
    close: {
        padding: theme.spacing(0.5),
    },

}));

export default observer(Message)