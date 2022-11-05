import React, {useContext, useEffect, useState} from "react"
import {observer} from 'mobx-react-lite'
import {Virtuoso} from "react-virtuoso"
import {makeStyles} from "@material-ui/core/styles"
import {searchResultsUrl, ITEMS_PER_PAGE} from "../../constants/constants"
import {Link} from "react-router-dom"
import ReactHtmlParser from "react-html-parser"
import {Typography} from "@material-ui/core"
import {parseEnglishRef} from "../../utils/parseBiblicalReference"
import {storeContext} from "../../stores/context"
import {messageContext} from "../../stores/messages/messageContext";
import {slug} from "../../utils/utils"
import {fetchData} from "../api/dataFetch";
import '../../css/search.css'


const SearchResults = () => {
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const classes = useStyles()
    const [search] = useState(store.getSearch())
    const [didYouMean, setDidYouMean] = useState(false)
    const [searchTerm, setSearchTerm] = useState(store.getSearch())
    const [page, setPage] = useState(1)

    const itemContent = (item, data) => {
        if (data['path'] === 'Tanakh') {
            const {refBook, refChapter, refVerse} = parseEnglishRef(data['ref'])
            store.resetPanes()
            return (
                <div className={classes.card}>
                    <Link to={`/Tanakh/${refBook}/${refChapter}/${refVerse}/`}>
                        <Typography variant="h6" component="h2">{data['ref']}</Typography>
                    </Link>
                    {ReactHtmlParser(data['text'])}
                    <hr/>
                </div>)
        }
        const [refBook, paragraph] = data['ref'].trim().split('#')
        const url = slug(refBook)
        store.resetPanes()

        return (
            <div className={classes.card}>
                <Link to={`/${data['path']}/${url}/${paragraph}/`}>
                    <Typography variant="h6" component="h2">{refBook}</Typography>
                </Link>
                {ReactHtmlParser(`<p>${data['text']}</p>`)}
                <hr/>
            </div>)
    }

    const nextPage = () => {
        if (store.getMoreResults()) {
            setPage(() => page + 1)
        }
    }

    useEffect(() => {

        if (search === '') return {'data': [], 'page': 1}

        store.setLoading(true)
        fetchData(searchResultsUrl + `${search}/${page}/`)
            .then((data) => {
                // if search result length is an exact multiple of ITEMS_PER_PAGE
                // an extra call is done to figure out that next page
                // is empty, In all other cases there is no need to do an extra call.
                // todo: review this code

                if (data['data'].length < ITEMS_PER_PAGE) {

                    store.setMoreResults(false)
                }
                store.setSearchResultData(data['data'])
                setPage(() => parseInt(data['page']))
                // this means that search term was not found and a similarity search was done
                setDidYouMean(data['did_you_mean'])
                setSearchTerm(() => data['search_term'])
                store.setLoading(false)
            })
            .catch(e => {
                message.setMessage(e.message)
                store.setLoading(false)
            })


    }, [search, page, store,message])

    if (store.getSearch() === '') return null

    return (
        <div className={classes.container}>
            <Typography className={classes.header} variant="h5">
                {didYouMean ? `Did you mean "${searchTerm}" ?` : `Search results for "${store.getSearch()}"`}
            </Typography>
            <Virtuoso
                data={store.getSearchResultData()}
                endReached={nextPage}
                itemContent={itemContent}
                components={{
                          Footer: () => {
                              return (
                                  <div style={{padding: '1rem', textAlign: 'center'}}>
                                     End of search results for "{store.getSearch()}"
                                  </div>
                              )
                          }
                      }}
            />
        </div>
    )
}

const useStyles = makeStyles((theme) => ({
    container: {
        position:'sticky',
        top:100,
        width: '100%',
        height: 'calc(80% - 110px)',
        fontSize: 21,
    },
    card: {
        maxWidth: '60%',
        [theme.breakpoints.down('md')]: {
            maxWidth: '85%',
        },
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    header: {
        maxWidth: '60%',
        [theme.breakpoints.down('md')]: {
            maxWidth: '85%',
        },
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 50,
    },

}))

export default observer(SearchResults)
