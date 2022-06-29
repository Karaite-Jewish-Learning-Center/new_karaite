import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
// import IconButton from '@material-ui/core/IconButton';
// import MenuItem from '@material-ui/core/MenuItem';
// import Menu from '@material-ui/core/Menu';
// import PermContactCalendarSharpIcon from '@material-ui/icons/PermContactCalendarSharp';
// import ExitToAppIcon from '@material-ui/icons/ExitToApp';
// import MoreIcon from '@material-ui/icons/MoreVert';
// import LanguageIcon from '@material-ui/icons/Language';
// import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Hidden, Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';
import AutoComplete from '../autcomplete/autocomplete'


export default function PrimarySearchAppBar({theme}) {
    // const [anchorEl, setAnchorEl] = useState(null);
    //const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const classes = useStyles();
    // const isMenuOpen = Boolean(anchorEl);
    // const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
    //
    // const handleLanguageMenuOpen = (event) => {
    //      event.preventDefault()
    //     if (anchorEl === null) {
    //         setAnchorEl(event.currentTarget)
    //     } else {
    //         setAnchorEl(null)
    //     }
    // };

    // const handleMobileMenuClose = () => {
    //     setMobileMoreAnchorEl(null);
    // };

    // const handleMenuClose = () => {
    //     setAnchorEl(null);
    //     handleMobileMenuClose();
    // };

    // const handleMobileMenuOpen = (event) => {
    //     setMobileMoreAnchorEl(event.currentTarget);
    // };

    // const menuId = 'site-language';
    // const renderMenu = (
    //     <Menu
    //         anchorEl={anchorEl}
    //         anchorOrigin={{vertical: 'top', horizontal: 'right'}}
    //         id={menuId}
    //         keepMounted
    //         transformOrigin={{vertical: 'top', horizontal: 'right'}}
    //         open={isMenuOpen}
    //         onClose={handleMenuClose}
    //     >
    //         <MenuItem onClick={handleMenuClose}>English</MenuItem>
    //         <MenuItem onClick={handleMenuClose}>עברית</MenuItem>
    //     </Menu>
    // );
    //
    // const mobileMenuId = 'site-language-mobile';
    // const renderMobileMenu = (
    //     <Menu
    //         anchorEl={mobileMoreAnchorEl}
    //         anchorOrigin={{vertical: 'top', horizontal: 'right'}}
    //         id={mobileMenuId}
    //         keepMounted
    //         transformOrigin={{vertical: 'top', horizontal: 'right'}}
    //         open={isMobileMenuOpen}
    //         onClose={handleMobileMenuClose}
    //     >
    //         <MenuItem>
    //             <IconButton aria-label="Go to sign up page" color="inherit">
    //                 <PermContactCalendarSharpIcon></PermContactCalendarSharpIcon>
    //             </IconButton>
    //             <p>Sign up</p>
    //         </MenuItem>
    //         <MenuItem>
    //             <IconButton aria-label="show 11 new notifications" color="inherit">
    //                 <ExitToAppIcon></ExitToAppIcon>
    //             </IconButton>
    //             <p>Login</p>
    //         </MenuItem>
    //         <MenuItem onClick={handleLanguageMenuOpen}>
    //             <IconButton
    //                 aria-label="Change site language"
    //                 aria-controls="site-language"
    //                 color="inherit"
    //             >
    //                 <LanguageIcon/><ArrowDropDownIcon/>
    //             </IconButton>
    //             <p>Site Language</p>
    //         </MenuItem>
    //     </Menu>
    // );
    //
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
                    {/*<IconButton aria-label="Go to sign up form" color="inherit">*/}
                    {/*    <PermContactCalendarSharpIcon data-for="en" data-tip="Sign up"></PermContactCalendarSharpIcon>*/}
                    {/*</IconButton>*/}
                    {/*<IconButton aria-label="Go to Login form" color="inherit">*/}
                    {/*    <ExitToAppIcon></ExitToAppIcon>*/}
                    {/*</IconButton>*/}
                    {/*<IconButton*/}
                    {/*    edge="end"*/}
                    {/*    aria-label="Site language"*/}
                    {/*    aria-controls={menuId}*/}
                    {/*    onClick={handleLanguageMenuOpen}*/}
                    {/*    color="inherit"*/}
                    {/*>*/}
                    {/*    <LanguageIcon/><ArrowDropDownIcon/>*/}
                    {/*</IconButton>*/}
                </div>
                <div className={classes.sectionMobile}>
                    <AutoComplete/>
                    {/*<IconButton*/}
                    {/*    aria-label="show more"*/}
                    {/*    aria-controls={mobileMenuId}*/}
                    {/*    onClick={handleMobileMenuOpen}*/}
                    {/*    color="inherit"*/}
                    {/*>*/}
                    {/*    <MoreIcon/>*/}
                    {/*</IconButton>*/}
                </div>
            </Toolbar>
            {/*{renderMenu}*/}
            {/*{renderMobileMenu}*/}

        </AppBar>

    );
}

const useStyles = makeStyles((theme) => ({
    sectionDesktop: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        [theme.breakpoints.down('xl')]: {
            display: 'flex',
        },
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        }
    },
    sectionMobile: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        [theme.breakpoints.down('xl')]: {
            display: 'none',
        },
        [theme.breakpoints.down('sm')]: {
            display: 'flex',
        },
    },


    name: {
        fontSize: 24,
    },
    link: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 2,
    },

}));
