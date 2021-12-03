import React, {useContext, useEffect, useState} from "react"
import {observer} from 'mobx-react-lite'
import {Virtuoso} from "react-virtuoso"
import Loading from "../general/Loading"
import {makeStyles} from "@material-ui/core/styles"
import {searchResultsUrl, ITEMS_PER_PAGE} from "../../constants/constants"
import {Link} from "react-router-dom"
import ReactHtmlParser from "react-html-parser"
import {addTagToString} from "../../utils/addTagToString"
import {Typography} from "@material-ui/core"
import {parseEnglishRef} from "../../utils/parseBiblicalReference"
import {storeContext} from "../../stores/context"
import {Please} from "../messages/Please"

const SearchResults = () => {
    const store = useContext(storeContext)
    const classes = useStyles()
    const [message, setMessage] = useState('Loading')
    const [search] = useState(store.getSearch().replace(' & ', ' '))
    const [page, setPage] = useState(1)

    const itemContent = (item, data) => {
        const {refBook, refChapter, refVerse} = parseEnglishRef(data['ref'])

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
        if (store.getMoreResults()) {
            setPage(() => page + 1)
        }
    }

    useEffect(() => {
        const getSearchResult = async () => {
            if (search === '') return {'data': [], 'page': 1}
            const response = await fetch(searchResultsUrl + `${search}/${page}/`)
            return  await response.json()
        }

        getSearchResult()
            .then((data) => {

                // if search result length is an exact multiple of ITEMS_PER_PAGE
                // an extra call is done to figure out that next page
                // is empty, In all other cases there is no need to do an extra call.

                if (data['data'].length < ITEMS_PER_PAGE) {
                    store.setMoreResults(false)
                    setMessage(() => `End of search results for "${store.getSearch().replace(' & ', ' ')}"`)
                }
                store.setSearchResultData(data['data'])
                setPage(()=>parseInt(data['page']))
            })
            .catch(e => store.setMessage(e.message))

    }, [search, page, store])

    if (store.getSearch() === '') return <Please reason="search"/>
    return (
        <div className={classes.container}>
            <Typography className={classes.header} variant="h5">
                Results for "{search}"
            </Typography>
            <Virtuoso
                data={store.getSearchResultData()}
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
        margin: 20,
    },
    header: {
        marginLeft: 20,
    },
}))

export default observer(SearchResults)
