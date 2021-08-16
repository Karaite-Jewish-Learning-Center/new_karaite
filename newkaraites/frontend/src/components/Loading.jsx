import React from 'react';
import ReactLoading from 'react-loading';
import {makeStyles} from '@material-ui/core/styles';
import Colors from '../constants/colors'

const Loading = (props) => {
    const classes = useStyles()
    const {color, type, text} = props
    return (
        <div className={classes.loading}>
            {(text ? <p>{text}</p>:<ReactLoading type={type} color={color} height={30} width={30}/>)}
        </div>
    )
}

export default Loading

Loading.defaultProps = {
    color:Colors.loading,
    type:'spin'
}

const useStyles = makeStyles(() => ({

    loading: {
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
    }
}))
