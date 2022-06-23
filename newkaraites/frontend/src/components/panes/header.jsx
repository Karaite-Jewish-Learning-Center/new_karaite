import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Colors from '../../constants/colors'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import CloseIcon from '@material-ui/icons/Close';
import Container from "@material-ui/core/Container";
import LanguageButton from "../buttons/LanguageButton";

const Header = ({ backButton, onClose }) => {
    const classes = useStyles()

    return (
        <Container className={classes.container}>

                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.iconGrid} />
                </IconButton>


                <IconButton
                    aria-label="Back"
                    component="span"
                    onClick={()=>{}}
                >
                    <ChevronLeftIcon className={classes.iconGrid} />
                </IconButton>

                <LanguageButton paneNumber={0} />
        </Container>
    )

}

export default Header


const useStyles = makeStyles((theme) => ({
    container: {
        padding: 0,
        backgroundColor: (theme.palette.type === 'dark' ? theme.palette.action.selected : theme.palette.background.paper),
    },
    icon:{},
    iconGrid:{},
    header: {
        minHeight: 50,
    },
}));