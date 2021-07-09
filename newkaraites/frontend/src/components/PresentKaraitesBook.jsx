import React, {useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import KaraitesBooks from "./karaitesBooks";
import BiblicalText from "./BiblicalText";

const GRID_LEFT = 0
const GRID_RIGHT = 1

export default function PresentKaraitesBooks() {
    const [gridSize, setGridSize] = useState([3, 3])
    const classes = useStyles()
    return (
        <div className={classes.container}>
            <Grid container spacing={1}>
                <Grid item xs={gridSize[GRID_LEFT]} className={classes.left}>
                    <KaraitesBooks book={'Yeriot Shelomo'} chapter={0} fullBook={true}/>
                </Grid>
                <Grid item xs={gridSize[GRID_RIGHT]}>
                    <BiblicalText book={'Psalms'} chapter={6} verse={1} fullBook={false}/>
                </Grid>
                <Grid item xs={gridSize[GRID_RIGHT]}>
                    <BiblicalText book={'Psalms'} chapter={148} verse={1} fullBook={true}/>
                </Grid>
                 <Grid item xs={gridSize[GRID_RIGHT]}>
                    <BiblicalText book={'Psalms'} chapter={148} verse={1} fullBook={true}/>
                </Grid>
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
        top: 75,
    },
    left: {
        height: '85vh',
        top: 75,
    }

}));