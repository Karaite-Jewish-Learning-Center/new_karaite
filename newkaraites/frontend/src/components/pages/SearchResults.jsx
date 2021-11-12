import React, {useContext, useEffect, useState} from "react"
import {observer} from 'mobx-react-lite'
import {Virtuoso} from "react-virtuoso"
import Loading from "../Loading"
import {makeStyles} from "@material-ui/core/styles"
import {searchResultsUrl} from "../../constants/constants"
import {Link} from "react-router-dom"
import ReactHtmlParser from "react-html-parser"
import {addTagToString} from "../../utils/addTagToString"
import {Typography} from "@material-ui/core"
import {ITEMS_PER_PAGE} from "../../constants/constants"
import {parseEnglishRef} from "../../utils/parseBiblicalReference"
import {storeContext} from "../../stores/context"


const SearchResults = () => {
    const store = useContext(storeContext)
    const classes = useStyles()
    const [searchResultData, setSearchResultData] = useState([])
    const [nextPageNumber, setNextPageNumber] = useState(1)
    const [moreResults, setMoreResults] = useState(true)
    const [message, setMessage] = useState('Loading')

    const itemContent = (item, data) =>{
        const { refBook, refChapter, refVerse} = parseEnglishRef(data['ref'])

        return (
            <div className={classes.card}>
                <Link to={`/Tanakh/${refBook}/${refChapter}/${refVerse}/`}>
                    <Typography variant="h6" component="h2">{data['ref']}</Typography>
                </Link>
                {ReactHtmlParser(`<p>${addTagToString(data['text'], store.getSearch(), 'b')}</p>`)}
                <hr/>
            </div>)
    }

    const nextPage = () => {
        debugger
        if (moreResults) {
            setNextPageNumber(() => nextPageNumber + 1)
        }
    }

    const getSearchResult = async () => {

        const response = await fetch(searchResultsUrl + `${store.getSearch()}/${nextPageNumber}/`)
        if (response.ok) {
            const data = await response.json()

            // if search result length is an exact multiple of ITEMS_PER_PAGE
            // an extra call is done to figure out that next page
            // is empty, In all other cases there is no need to do an extra call.

            if (data['data'].length < ITEMS_PER_PAGE) {
                setMoreResults(() => false)
                setMessage(() => `End of search results for "${store.getSearch().replace(' & ', ' ')}"`)
            }
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
            <Typography className={classes.header} variant="h5">Results for "{store.getSearch().replace(' & ', ' ')}"</Typography>
            <Virtuoso
                data={searchResultData}
                endReached={nextPage}
                itemContent={itemContent}
                components={{
                    Footer: () => <Loading text={message}/>
                }}
            />
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        marginTop: 100,
        margin: 20
    },
    card: {
        // maxWidth: '80%',
        // minWidth: '80%',
        margin: 20,
    },
    header: {
        marginLeft: 20,
    },
}))

export default observer(SearchResults)
