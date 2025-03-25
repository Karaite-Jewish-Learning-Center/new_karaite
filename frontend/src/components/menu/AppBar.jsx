import { Hidden, Typography } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import { Link } from 'react-router-dom';
import AutoComplete from '../autcomplete/autocomplete';

export default function PrimarySearchAppBar({ themeMode, onThemeToggle }) {
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

                <div className={classes.sectionDesktop}>
                    <AutoComplete />
                    <IconButton
                        color="inherit"
                        onClick={onThemeToggle}
                        className={classes.themeButton}
                    >
                        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </div>
            </Toolbar>
        </AppBar>
    );
}

const useStyles = makeStyles((theme) => ({
    sectionDesktop: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        display: 'flex',
        alignItems: 'center',
    },
    themeButton: {
        marginLeft: theme.spacing(2),
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
