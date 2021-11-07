import React, {useEffect} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import {searchResultsUrl} from "../../constants/constants";


export const SearchResult = ({search}) => {
    const classes = useStyles()
    debugger

    const getSearchResult = async () => {

        const response = await fetch(searchResultsUrl + `${search}/`)
        if (response.ok) {
            const data = await response.json()
            debugger
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getSearchResult()
    }, [])

    return (
        <div className={classes.container}>
            <p className={classes.center}>The search result:{search}</p>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        width: '100%',
        height: '100%',
        justifyContent: 'center',
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
}));

