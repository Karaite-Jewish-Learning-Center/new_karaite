import React from 'react';
import './spin.css'
import {makeStyles} from '@material-ui/core/styles';

const Loading = ({text}: { text?: string }) => {
    const classes = useStyles()
    return (
        <div className={classes.loading}>
            {(text ? <p>{text}</p> : <div className={'spin'}></div>)}
        </div>
    )
}

Loading.defaultProps = {
    type: 'spin'
}

const useStyles = makeStyles(() => ({
    loading: {

        display: 'flex',
        justifyContent: 'center',
    }
}))

export default Loading