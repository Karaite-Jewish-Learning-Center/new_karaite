import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import {Hidden, Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';
import AutoComplete from '../autcomplete/autocomplete'


export default function PrimarySearchAppBar({theme}) {

    const classes = useStyles();

    return (

        <AppBar position="fixed" color="default">
            <Toolbar>
                <Typography className={classes.name} component="h3">
                    <Link className={classes.link} to="/">KJLC</Link>
                </Typography>
                <Typography component="h3">
                    <Link className={classes.link} to="/texts/">Texts</Link>
                </Typography>
                <Hidden smDown>
                    <Typography component="h3">
                        <a className={classes.link} href="https://www.karaites.org/support-our-work1.html" rel="noreferrer" target="_blank">Donate</a>
                    </Typography>
                    <Typography component="h3">
                        <Link className={classes.link} to="/acknowledgments/">Acknowledgments</Link>
                    </Typography>
                </Hidden>
                {/*<Typography component="h3">*/}
                {/*    <Link className={classes.link} to="/"><SearchIcon /></Link>*/}
                {/*</Typography>*/}

                <div className={classes.sectionDesktop}>
                    <AutoComplete/>

                </div>
                {/*<div className={classes.sectionMobile}>*/}
                {/*    <AutoComplete/>*/}
                {/*    */}
                {/*</div>*/}
            </Toolbar>
        </AppBar>

    );
}

const useStyles = makeStyles((theme) => ({
    sectionDesktop: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        display: 'flex',
        // [theme.breakpoints.down('xl')]: {
        //     display: 'flex',
        // },
        // [theme.breakpoints.down('sm')]: {
        //     display: 'none',
        // }
    },
    // sectionMobile: {
    //     flexGrow: 1,
    //     justifyContent: 'flex-end',
    //     [theme.breakpoints.down('xl')]: {
    //         display: 'none',
    //     },
    //     [theme.breakpoints.down('sm')]: {
    //         display: 'flex',
    //     },
    // },


    name: {
        fontSize: 24,
    },
    link: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 2,
    },

}));
