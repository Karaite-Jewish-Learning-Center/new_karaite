import React, {useState, useEffect, useContext} from 'react'
import { karaitesBookToc } from '../constants/constants'
import { booksMenu } from '../constants/common-css'
import { Grid, Typography } from '@material-ui/core'
import { unslug } from '../utils/utils'
import { Link } from 'react-router-dom'
import {storeContext} from "../stores/context";



const HalakhahMenu = ({ book }) => {
    const store = useContext(storeContext)
    const [toc, setToc] = useState([])

    const classes = booksMenu()
    // todo find a better solution
    store.setIsLastPane(false)

    const getTOC = async (book) => {

        const response = await fetch(`${karaitesBookToc}${book}/`)
        if (response.ok) {
            const data = await response.json()
            setToc(data)
        } else {
            alert("HTTP-Error: " + response.status)
        }

    }

    const TableOfContents = () => {
        return toc.map(index =>
            <Grid container
                direction="row"
                spacing={2}
                key={`h-${index[2]}`}
            >
                <Grid item className={classes.left} >
                    <Link to={`/Halakhah/${book}/${index[2]}/`} >
                        <Typography className={classes.he}>{index[1]}</Typography>
                    </Link>
                </Grid>

                <Grid item className={classes.right}>
                    <Link to={`/Halakhah/${book}/${index[2]}/`}>
                        <Typography className={classes.he}>{index[0]}</Typography>
                    </Link>
                </Grid>

            </Grid>

        )
    }
    useEffect(() => {
        getTOC(book)
    }, [book])

    return (
        <div className={classes.container}>
            <div className={classes.filler}>&nbsp;</div>
            <Typography className={classes.titleHalakhah} variant="h6" component="h2">{unslug(book)}</Typography>

            <Link className={classes.link} to='/Halakhah/'>To books list</Link>

            <hr className={classes.ruler} />
            <TableOfContents />
        </div>
    )
}

export default HalakhahMenu