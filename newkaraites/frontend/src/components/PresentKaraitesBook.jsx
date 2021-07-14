import React, {useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import KaraitesBooks from "./karaitesBooks";
import BiblicalText from "./BiblicalText";
import parseBiblicalReference from "../utils/parseBiblicalReference";


export default function PresentKaraitesBooks() {
    const [panes, setPanes] = useState([])

    const classes = useStyles()

    const refClick = (e) => {
        const {book, chapter, verse, highlight} = parseBiblicalReference(e)
        setPanes([...panes, {book:book, chapter:chapter, verse:verse, highlight:highlight}])
    }

    const onClosePane = (position) => {
        panes.splice(position, 1)
        setPanes([...panes])
    }

    return (
        <div className={classes.container}>
            <Grid container spacing={0}>
                <Grid item xs className={classes.left}>
                    <KaraitesBooks book={'Yeriot Shelomo'} chapter={2} fullBook={true} refClick={refClick}/>
                </Grid>
                {panes.map((pane,i) => (
                    <Grid item xs>
                        <BiblicalText book={pane.book}
                                chapter={pane.chapter}
                                verse={pane.verse}
                                highlight={pane.highlight}
                                fullBook={false}
                                onClosePane={onClosePane.bind(this,i)}/>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        flexGrow: 1,
        position: 'fixed',
        width: '100%',
        height: '85vh',
        top: 60,
    },
    left: {
        height: '85vh',
        top: 70,
    }

}));