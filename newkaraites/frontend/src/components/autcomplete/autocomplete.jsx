import React, {useState, useEffect, useContext} from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {autocompleteUrl} from '../../constants/constants'
import {apiFetch} from "../api/apiFetch";
import {storeContext} from "../../stores/context"
import {useHistory} from "react-router-dom"


export const AutoComplete = () => {

    const store = useContext(storeContext)
    const [isOpen, setIsOpen] = useState(true)
    const [search, setSearch] = useState(store.getSearch())
    const [options, setOptions] = useState([])
    let history = useHistory()

    const getAutoComplete = () => {

        if (search.length < 2) return

        apiFetch(`${autocompleteUrl}${search}/`)
            .then((response) => {
                setOptions(response)
            })
            .catch(e => {
                console.log(e)
            })
    }

    const showResults = () => {
        if (search.length === 0) return
        if (store.getSearch() !== search || window.location.pathname !== '/search-result/') {
            store.setSearch(search)
            history.push('/search-result/')
        }
    }

    const onInputChange = (e, newValue) => {
        setSearch(() => newValue)
    }

    const onKeyUp = (event) => {
        if (event.code === "Enter") {
            showResults()
        }
    }

    const onChange = (e, value, reason) => {
        if (reason === 'select-option') {
            setSearch(() => value)
        }
    }

    const onClose = () => {
        setIsOpen(false)
    }

    useEffect(() => {
        getAutoComplete()
    }, [search]);

    return (
        <Autocomplete
            freeSolo
            open={true}
            value={search}
            options={options}
            onKeyUp={onKeyUp}
            onChange={onChange}
            onClose={onClose}
            getOptionLabel={(option) => option}
            style={{width: 300, marginRight: 40}}
            inputValue={search}
            onInputChange={onInputChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search"
                    variant="standard"
                />
            )}
        />
    );
}
