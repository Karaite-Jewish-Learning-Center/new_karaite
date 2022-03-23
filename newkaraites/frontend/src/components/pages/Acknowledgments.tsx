import React, {useContext} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {storeContext} from "../../stores/context";
import Colors from "../../constants/colors";

const Acknowledgment = () => {
    const classes = useStyles()
    const store = useContext(storeContext)
    store.resetPanes()

    return (
        <div className={classes.container}>
            <div className={classes.center}>
                <div>
                    <h1 className={classes.title}>Thank You a Million Times</h1>
                    <hr className={classes.ruler}/>
                </div>
                <p className={classes.text}>The Karaite Jewish Learning Center (and the Karaite Jews of America) extend
                    our deepest gratitude to
                    the many people whose financial and temporal support made this endeavor possible. First and
                    foremost, we thank the following people for typing, transliterating, and translating the numerous
                    texts that appear at the KJLC: Michael Bernstein, Shoshana (Firrouz) Cohen, Eliyahu Friedman, Noam
                    Harris, Yinon Kahan, Gabriel Wasserman, Barnaby Yeh, and Tzemah Yoreh. We would also like to thank
                    the following for their financial support in the early days of developing this platform: Matt Ronin
                    and Amanda Bressler; the Bequest of Zaki Lichaa; James and Leah Walker; and Micah Levinson (whose
                    donation was made in memory of his father). We also are thankful to the various translators whose
                    works jumpstarted The Karaite Press. Those works form the initial English translations of books that
                    will be available on this site. You can read more about those translators in the introductions of
                    those respective books.</p>
                <p>We also thank Shawn Lichaa for coordinating this project.</p>
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
    },
    center: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 21,
    },
    title: {
        color: Colors.tanakh,
        margin:0,
    },
    ruler: {
        color: Colors.rulerColor,
        width: '100%'

    },
    text: {
        textAlign: 'justify',
    },
}));


export default Acknowledgment