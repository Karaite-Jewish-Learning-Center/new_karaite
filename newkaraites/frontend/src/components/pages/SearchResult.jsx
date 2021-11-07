import React, {useContext, useEffect, useState} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {searchResultsUrl} from "../../constants/constants";
import {storeContext} from "../../stores/context";
import {Grid, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";
import Colors from "../../constants/colors";
import {addTagToString} from "../../utils/addTagToString";
import ReactHtmlParser from 'react-html-parser';

export const SearchResult = () => {
    const store = useContext(storeContext)
    const [results, setResults] = useState([])
    const classes = useStyles()
    const search = 'kings'

    const getSearchResult = async () => {
        const response = await fetch(searchResultsUrl + `${search}/`)
        if (response.ok) {
            const data = await response.json()
            debugger
            setResults(data)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getSearchResult()
    }, [])

    const ResultsHeader = () => {
        return (
            <div className={classes.header}>
                <Typography className={classes.title} variant="h4">Results for "{search}"</Typography>
                <Typography className={classes.sub} variant="h6">100 Results</Typography>
            </div>
        )
    }
    const Results = () => {
        return Object.keys(results).map(key =>
            <Grid item key={key} className={classes.card}>
                <Link to={'/' + key + '/'}>
                    <Typography variant="h6" component="h2">{key}</Typography>
                </Link>
                <br/>
                //todo: do this is the backend
                {ReactHtmlParser( `<p >${addTagToString(results[key], search, 'b')}</p>`)}
                <hr/>
            </Grid>)
    }


    return (
        <div className={classes.container}>
            <ResultsHeader/>
            <Grid container xs
                  direction="row"
                  spacing={2}
            >
                <Results/>
            </Grid>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        margin: 20
    },
    header: {
        top: 100,
        margin: 20,
        marginTop: 90,
    },
    center: {
        display: 'flex',
        alignItems: 'center',
    },
    fontSmall: {
        fontSize: 25,
    },
    fontLarge: {
        fontSize: 40,
    },
    card: {
        maxWidth: '80%',
        minWidth: '80%',
        margin: 20,

    },
    title: {
        color: Colors['black']
    },
    sub: {
        color: Colors['gray']
    }
}));

