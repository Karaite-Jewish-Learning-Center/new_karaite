import React from 'react'
import {makeStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import CloseIcon from '@material-ui/icons/Close';
import Container from "@material-ui/core/Container";
import LanguageButtonReferences from "../buttons/LanguageButtonReferences";


const Header = ({backButton, onClose, onClick, language}) => {
    const classes = useStyles()


    return (<Container className={classes.container}>
            <span>
                <IconButton
                    aria-label="Close pane"
                    component="span"
                    onClick={onClose}
                >
                    <CloseIcon className={classes.iconGrid}/>
                </IconButton>

                {backButton &&
                <IconButton
                    aria-label="resources"
                    component="span"
                    onClick={backButton}
                >
                    <ChevronLeftIcon className={classes.iconGrid}/>
                </IconButton>}

            </span>
            <LanguageButtonReferences language={language} onClick={onClick}/>
        </Container>)

}

export default Header


const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 0,
        backgroundColor: (theme.palette.type === 'dark' ? theme.palette.action.selected : theme.palette.background.paper),
    }, icon: {}, iconGrid: {}, header: {
        minHeight: 50,
    },
}));