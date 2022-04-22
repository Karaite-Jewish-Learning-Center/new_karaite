import React, {useState} from 'react';
import {fade, makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import PermContactCalendarSharpIcon from '@material-ui/icons/PermContactCalendarSharp';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MoreIcon from '@material-ui/icons/MoreVert';
import LanguageIcon from '@material-ui/icons/Language';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import {Typography} from '@material-ui/core';
import {Link} from 'react-router-dom';
import AutoComplete from '../autcomplete/autocomplete'
import {Vkeybord} from "../vkeyboard/keyboard";
import {KeyboardButton} from "../buttons/KeyboardButton";



export default function PrimarySearchAppBar() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
    const [keyboardOpen, setKeyboardOpen] = useState(false)
    const classes = useStyles();
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const onKeyboardButton =() => setKeyboardOpen(!keyboardOpen)

    const handleLanguageMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const menuId = 'site-language';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            id={menuId}
            keepMounted
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose}>English</MenuItem>
            <MenuItem onClick={handleMenuClose}>עברית</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'site-language-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem>
                <IconButton aria-label="Go to sign up page" color="inherit">
                    <PermContactCalendarSharpIcon></PermContactCalendarSharpIcon>
                </IconButton>
                <p>Sign up</p>
            </MenuItem>
            <MenuItem>
                <IconButton aria-label="show 11 new notifications" color="inherit">
                    <ExitToAppIcon></ExitToAppIcon>
                </IconButton>
                <p>Login</p>
            </MenuItem>
            <MenuItem onClick={handleLanguageMenuOpen}>
                <IconButton
                    aria-label="Change site language"
                    aria-controls="site-language"
                    color="inherit"
                >
                    <LanguageIcon/><ArrowDropDownIcon/>
                </IconButton>
                <p>Site Language</p>
            </MenuItem>
        </Menu>
    );

    return (

        <AppBar position="fixed">
            <Toolbar>
                <Typography className={classes.name} component="h3">
                    <Link className={classes.link} to="/">KJLC</Link>
                </Typography>
                <Typography component="h3">
                    <Link className={classes.link} to="/texts/">Texts</Link>
                </Typography>
                <Typography component="h3">
                    <a className={classes.link} href="https://www.karaites.org/support-our-work1.html" rel="noreferrer" target="_blank">Donate</a>
                </Typography>
                <Typography component="h3">
                    <Link className={classes.link} to="/acknowledgments/">Acknowledgments</Link>
                </Typography>
                {/*<Typography component="h3">*/}
                {/*    <Link className={classes.link} to="/"><SearchIcon /></Link>*/}
                {/*</Typography>*/}

                <div className={classes.sectionDesktop}>
                    <AutoComplete/>
                    <KeyboardButton onClick={onKeyboardButton} open={keyboardOpen} />
                    {/*<Vkeybord />*/}
                    <IconButton aria-label="Go to sign up form" color="inherit">
                        <PermContactCalendarSharpIcon data-for="en" data-tip="Sign up"></PermContactCalendarSharpIcon>
                    </IconButton>
                    <IconButton aria-label="Go to Login form" color="inherit">
                        <ExitToAppIcon></ExitToAppIcon>
                    </IconButton>
                    <IconButton
                        edge="end"
                        aria-label="Site language"
                        aria-controls={menuId}
                        onClick={handleLanguageMenuOpen}
                        color="inherit"
                    >
                        <LanguageIcon/><ArrowDropDownIcon/>
                    </IconButton>
                </div>
                <div className={classes.sectionMobile}>
                    <IconButton
                        aria-label="show more"
                        aria-controls={mobileMenuId}
                        onClick={handleMobileMenuOpen}
                        color="inherit"
                    >
                        <MoreIcon/>
                    </IconButton>
                </div>
            </Toolbar>
            {renderMenu}
            {renderMobileMenu}

        </AppBar>

    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: 'lightgray',
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },

    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
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
    fab: {
        margin: theme.spacing(2),
    },
    absolute: {
        position: 'absolute',
        bottom: theme.spacing(2),
        right: theme.spacing(3),
    },
    toolBar: {
        marginBottom: theme.spacing(20)
    },
    name: {
        fontSize: 24,
        color: 'black',
    },
    link: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 2,
        color: 'black',
    },

}));
