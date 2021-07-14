import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import LocationOnIcon from '@material-ui/icons/LocationOn';


export default function BibleBottomNavigation() {
    const [value, setValue] = useState();
    const classes = useStyles();

    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            showLabels
            className={classes.root}
        >
            <BottomNavigationAction  icon={<RestoreIcon/>}/>
            <BottomNavigationAction  icon={<FavoriteIcon/>}/>
            <BottomNavigationAction  icon={<LocationOnIcon/>}/>
        </BottomNavigation>
    );
}

const useStyles = makeStyles({
    root: {
        width: '50%',
    },
});
