import {makeStyles} from '@material-ui/core/styles'

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

export {
    commStyles,
    container
}