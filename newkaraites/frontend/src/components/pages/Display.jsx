import React, {useContext} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {storeContext} from "../../stores/context";
import useMediaQuery from '@material-ui/core/useMediaQuery'
import {q640} from "../../constants/constants"
import {Player} from 'webvtt-player'


const Display = () => {
    const classes = useStyles()
    const store = useContext(storeContext)
    const matches = useMediaQuery(q640)
    store.resetPanes()

    return (
        <div className={(matches ? classes.noSpace : classes.fill)}>
            <div className={classes.container}>
                <div className={classes.center}>
                    <div>
                        <h1 className={classes.title}>The Karaite Jewish Learning Center</h1>
                        <h1 className={classes.title}>(A Project of the Karaite Jews of America)</h1>
                        <hr className={classes.ruler}/>
                    </div>
                    <div className={classes.player}>
                    <Player
                        audio='http://localhost:8000/media/audio/parashat.mp3'
                        transcript='http://localhost:8000/media/audio/parashat.vtt'
                        preload={true}
                        />
                    </div>

                    <p className={classes.text}>

                        The Karaite Jews of America welcomes you to our new platform: The Karaite Jewish Learning
                        Center.
                        Our goal is to bring all Karaite literature online. Equally as important, however, we want to
                        help
                        you interact with these texts and integrate them into your learning.

                        <p className={classes.text}>In time, we plan to launch courses through the KJLC. These courses will include a wide range
                            of
                            topics under the broad umbrella of Karaitica.</p>

                        <p className={classes.questions}><b>Interested in Jewish poetry?</b> We have numerous poems with
                            translation and transliteration.
                        </p>

                        <p className={classes.questions}><b>Love comparing Karaite Views across the centuries?</b> We
                            already have many Hebrew texts
                            online and we
                            plan to roll out more English translations soon.</p>

                        <p className={classes.questions}><b>Can’t wait to improve your own Hebrew?</b> Many of our
                            Hebrew
                            texts have full vocalization and are
                            displayed side by side next to an English translation.</p>

                        <p className={classes.questions}><b> Want to become a hazzan or hazzanit?</b> We are here to
                            help
                            unlock your voice and soul.</p>

                        <p className={classes.textJoin}>Updates about the KJLC are distributed through the Karaite Jews
                            of America’s weekly
                            emails.</p>
                        <p className={classes.join}>
                            <b><a href="https://karaites.us11.list-manage.com/subscribe?u=0de7fd38ac5f9d2e4fe132fcc&id=f8db630877">Please
                                join our list </a></b>
                        </p>
                    </p>
                    <hr/>
                </div>
            </div>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        width: '70%',
        height: '100%',
        margin: 'auto',
        marginTop: 100,
    },
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom:100

    },
    player: {
        width: 400,
        height: 400,
    },
    boxTitle: {
        marginBottom: 20,
    },
    title: {
        margin: 0,
        textAlign: 'center',
    },
     ruler: {
        width: '100%',
    },
    text: {
        fontSize: 21,
        textAlign: 'justify',
        margin:0,
    },
    questions: {
        textAlign: 'justify',
        fontSize: 21,
    },
    join: {
        textAlign: 'center',
        marginLeft: '10%',
        marginRight: '10%',
        fontSize: 21,
        margin: 'auto'
    },
    textJoin: {
        textAlign: 'center',
        fontSize: 21,
        padding: 15,
    },
    noSpace: {
        paddingTop: 0,
    },
    fill: {
        paddingTop: 100,
    }
}));


export default Display