import React, {useState} from 'react'
import Grid from '@material-ui/core/Grid'
import BiblicalText from "./BiblicalText";
import {container} from "../constants/common-css";

export default function BibleBooksWithComments() {
    const [panes, setPanes] = useState([])

    const classes = container()
    return (
        <div className={classes.container}>
            <Grid container spacing={0}>
                {panes.map((pane) => (
                    <Grid item xs>
                        <BiblicalText book={pane.book}
                                chapter={pane.chapter}
                                verse={pane.verse}
                                highlight={pane.highlight}
                                fullBook={false}
                                onClosePane={()=>{}}
                                comments={true}
                        />
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

