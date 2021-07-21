import React, {useState} from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}


export default function Message({message, severity, hide=2000 ,onClose}) {
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  const handleClose = () => {
    onClose()
    setOpen(false);
  };
  debugger
  if(message === "") return null

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={hide} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {[message]}
        </Alert>
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
}));
