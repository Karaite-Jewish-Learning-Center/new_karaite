import React from 'react'

import {torahPortions} from '../../constants/constants'
import {makeStyles} from "@material-ui/core/styles";


const TorahPortions = ({book}) => {
    const classes = useStyles()

    const MakePortions = () => {
        const keys = Object.keys(torahPortions[book])
        const parts = [0, 1, 2, 3, 4, 5, 6]
        debugger
        return keys.map((name, index) =>
            <div>
                <div><h1>{name}</h1></div>
                {parts.map(i =>
                    <div>
                        <span className={classes.portions}>{torahPortions[book][name][keys[index]]}</span>
                        <span className={classes.portions}>{i + 1}</span>
                    </div>
                )}
            </div>
        )

    }

    if (torahPortions[book] !== undefined) {
        return (
            <div>
                <div>Torah portions</div>
                <MakePortions/>
            </div>
        )

    } else {
        return null
    }
}


const useStyles = makeStyles((theme) => ({
    portions: {
        padding: 5,
    },
}));


export default TorahPortions