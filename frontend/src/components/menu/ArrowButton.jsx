import React from 'react';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import {makeStyles} from "@material-ui/core/styles";

const ArrowButton = ({direction, onClick, saying, style}) => {
    const classes = useStyles()

    return (
        <div className={classes.pointer} onClick={onClick}>
            <Typography variant="h6" className={style}>
             {saying} {direction ? <ArrowDropUpIcon /> : <ArrowDropDownIcon  />}
            </Typography>
        </div>
    )
}

export default ArrowButton;

const useStyles = makeStyles((theme) => ({
    pointer: {
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            transform: 'translateX(4px)',
        },
    },
}));
