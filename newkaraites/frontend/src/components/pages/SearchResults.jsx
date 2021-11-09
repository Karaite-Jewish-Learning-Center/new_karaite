import React, {useContext, useEffect, useState} from "react";
import {Virtuoso} from "react-virtuoso";
import Loading from "../Loading";
import {storeContext} from "../../stores/context";
import {makeStyles} from "@material-ui/core/styles";
import {searchResultsUrl} from "../../constants/constants";
import {Link} from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import {addTagToString} from "../../utils/addTagToString";
import {Typography} from "@material-ui/core";


export const SearchResults = () => {
    const store = useContext(storeContext)
    const classes = useStyles()
    const [searchResultData, setSearchResultData] = useState([])
    const [nextPageNumber, setNextPageNumber] = useState(1)
    const [message, setMessage] = useState('LOL')
    const search = 'god & light'

    const itemContent = (item, data) => {
        return (
            <div className={classes.card}>
                <Link to={`/${data['ref']}/`}>
                    <Typography variant="h6" component="h2">{data['ref']}</Typography>
                </Link>
                {ReactHtmlParser(`<p>${addTagToString(data['text'], search, 'b')}</p>`)}
                <hr/>
            </div>)
    }

    const nextPage = () => {
        setNextPageNumber(nextPageNumber + 1)
    }

    const getSearchResult = async () => {
        const response = await fetch(searchResultsUrl + `${search}/${nextPageNumber}/`)
        if (response.ok) {
            const data = await response.json()
            setSearchResultData(() => [...searchResultData, ...data['data']])
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getSearchResult()
    }, [nextPageNumber])

    return (
        <div className={classes.container}>
            <Virtuoso
                data={searchResultData}
                endReached={nextPage}
                itemContent={itemContent}
                components={{
                    Footer: () =>
                        <Loading text={message}/>
                }}
            />
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        margin: 20
    },
    card: {
        // maxWidth: '80%',
        // minWidth: '80%',
        margin: 20,
    },
}));