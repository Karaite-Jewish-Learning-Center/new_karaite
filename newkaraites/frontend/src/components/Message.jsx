import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import store from '../stores/appState'
import { observer } from 'mobx-react-lite';



const Message = ({ severity = 1, hide = 2000 }) => {
  const classes = useStyles();
  debugger

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
          vertical: 'bottom',
          horizontal: 'left',
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
            <CloseIcon />
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