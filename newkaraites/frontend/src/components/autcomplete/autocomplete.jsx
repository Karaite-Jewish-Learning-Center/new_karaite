import React, {useState, useEffect, useContext} from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {autocompleteUrl} from '../../constants/constants'
import {apiFetch} from "../api/apiFetch";
import {storeContext} from "../../stores/context"
import {useHistory} from "react-router-dom"

export const AutoComplete = () => {
    const store = useContext(storeContext)
    const [value, setValue] = useState(store.getSearch())
    const [search, setSearch] = useState(store.getSearch())
    const [options, setOptions] = useState([])
    let history = useHistory()

    const getAutoComplete = () => {
        if (search.length < 2) return undefined
        apiFetch(`${autocompleteUrl}${search}/`)
            .then((response) => {
                setOptions(response)
            })
            .catch(e => {
                console.log(e)
            })
    }

    useEffect(() => {
        getAutoComplete()
    }, [search]);

    const onClose = () => {
        setValue('')
    }

    const onKeyDown = (event) => {
        if (event.code === "Enter") {
            store.setSearch(search)
            history.push('/search-result/')
        }
    }

    return (
        <Autocomplete
            value={value}
            options={options}
            autoComplete={true}
            autoSelect={true}
            onClose={onClose}
            onKeyDown={onKeyDown}
            onChange={(e, newValue) => {
                setValue(newValue);
            }}

            getOptionLabel={(option) => option}
            style={{width: 300, marginRight: 40}}
            inputValue={search}
            onInputChange={(e, newValue) => {
                setSearch(() => newValue)
            }}
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
