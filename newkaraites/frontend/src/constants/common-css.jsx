import { makeStyles } from '@material-ui/core/styles'
import Colors from "./colors";

const container = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 60,
    },
    left: {
        height: '80vh',
        top: 60,
    },
    scroll: {
        maxHeight: '100vh',
        overflowY: 'auto',
    },
    root: {
        marginBottom: 20,
    },
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
    container,
    resources,
}