import React from "react";
import Box from '@material-ui/core/Box';
import {Typography} from '@material-ui/core';

const TabPanel =(props)=> {
    const {children, value, index, ...other} = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            <Box p={2}>
                <Typography>{children}</Typography>
            </Box>
        </div>
    );
}

export default TabPanel