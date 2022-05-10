import { makeStyles } from '@material-ui/core/styles'
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
        height: '80vh',
        top: 60,
    },
    scroll: {
        maxHeight: '100vh',
        overflowY: 'auto',
        // width: 'auto',
        // height: '85vh',
        // paddingRight: '30px !important'
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


// const booksMenu = makeStyles((theme) => ({
//     container: {
//         top:10,
//         display:"flex",
//         width: '100%',
//         height: '100%',
//         justifyContent:'center',
//         alignItems:'center'
//     },
//     card: {
//         maxWidth: 350,
//         minWidth:350,
//         width:'auto',
//         height: 100,
//         marginTop: 40,
//         marginBottom: 20,
//     },
//     title: {
//         marginBottom: 20,
//         color: 'gray',
//     },
//     titleHalakhah: {
//         marginBottom: 20,
//         color: 'gray',
//     },
//     link: {
//         marginBottom: 20,
//     },
//     ruler: {
//         marginTop: 30,
//         borderColor: Colors.rulerColor,
//     },
//     he: {
//         direction: 'ltr',
//         fontFamily: 'SBL Hebrew',
//         fontSize: 18,
//         color: Colors.gray,
//     },
//     left: {
//         minWidth: 600,
//
//     },
//     right: {
//         minWidth: 100,
//     },
//     filler:{
//         marginTop:70,
//     },
// }));

export {
    commStyles,
    container,
    resources,
    booksMenu,
}