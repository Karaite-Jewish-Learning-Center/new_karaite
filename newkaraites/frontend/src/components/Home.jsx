import React from "react"
import { makeStyles } from '@material-ui/core/styles'


const Home = () => {
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <div className={classes.center}>
                <p>Karaites the journey begins</p>
                <hr></hr>
            </div>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        height: '100%',
    },
    center: {
        fontSize: 40,
        position: 'relative',
        top: '40%',
        left: '33%',
        maxWidth: 460,

    }
}));


export default Home