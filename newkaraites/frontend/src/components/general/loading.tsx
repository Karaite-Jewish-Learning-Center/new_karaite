import React from 'react';
import ReactLoading from 'react-loading';
import {makeStyles} from '@material-ui/core/styles';

const Loading = ({color, type, text}:{color:any,type:any, text?:string  }) => {
    const classes = useStyles()
    return (
        <div className={classes.loading}>
            {(text ? <p>{text}</p>:<ReactLoading type={type} color={color} height={30} width={30}/>)}
        </div>
    )
}

Loading.defaultProps = {
    type:'spin'
}

const useStyles = makeStyles(() => ({
    loading: {
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
    }
}))

export default Loading