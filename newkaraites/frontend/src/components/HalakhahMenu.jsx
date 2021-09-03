import React, { useState, useEffect } from 'react'
import { karaitesBookToc } from '../constants/constants'
import { booksMenu } from '../constants/common-css'
import { Grid, Typography } from '@material-ui/core'
import { unslug } from '../utils/utils'
import { Link } from 'react-router-dom'

const HalakhahMenu = ({ book }) => {
    const [toc, setToc] = useState([])

    const classes = booksMenu()

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
                xs={true}
            >


                <Grid item className={classes.left} >
                    <Link to={`/Halakhah/${book}/${index[2]}/`} >
                        <Typography className={classes.he}>{index[1]}</Typography>
                    </Link>
                </Grid>

                <Grid item className={classes.right}  >
                    <Link to={`/Halakhah/${book}/${index[2]}/`} >
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
        <div container className={classes.container}>
            <div className={classes.filler}>&nbsp;</div>
            <Typography className={classes.title} variant="h6" component="h2">{unslug(book)}</Typography>
            <hr className={classes.ruler} />
            <TableOfContents />
        </div>
    )
}

export default HalakhahMenu