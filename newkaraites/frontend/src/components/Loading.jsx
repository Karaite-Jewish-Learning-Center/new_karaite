import React from 'react';
import ReactLoading from 'react-loading';
import Colors from '../constants/colors'

const Loading = ({color, type, style}) => {

    if (color === undefined) color = Colors.loading
    if (type === undefined) type = 'spin'
    return (
        <div className={style}>
            <ReactLoading type={type} color={color} height={30} width={30}/>
        </div>
    )
}

export default Loading