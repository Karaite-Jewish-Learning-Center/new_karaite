import {makeStyles} from '@material-ui/core/styles'
import Colors from "./colors";

const commStyles = {
    container: {
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 75,
    },
}

const container = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 60,
    },
    left: {
        height: '85vh',
        top: 60,
    },
    scroll:{
        overflow: 'auto',
        width: 'auto',
        height: '85vh',
        paddingRight: '30px !important'
    }
}));


const resources = makeStyles({
    resources: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
    },
    grid: {
        padding: 0,
        marginRight: 0,
    },
    iconGrid: {
        margin: 0,
        padding: 0,

    },
    iconButton: {
        marginRight: 12
    }

})

export {
    commStyles,
    container,
    resources
}