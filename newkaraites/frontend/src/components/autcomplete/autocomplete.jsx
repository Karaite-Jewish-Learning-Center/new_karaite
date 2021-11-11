import React, {useState, useEffect} from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {autocompleteUrl} from '../../constants/constants'
import {apiFetch} from "../api/apiFetch";

export const AutoComplete = () => {

    const [value, setValue] = useState('');
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState([])

    const getAutoComplete = () => {
        if (search.length < 2) return undefined
         apiFetch(`${autocompleteUrl}${search}/`)
             .then((response)=> {
              setOptions(response)
          })
             .catch(e=> {
             console.log(e)
          })
        }

    useEffect(() => {
        getAutoComplete()
    }, [search]);

    const onChange = (e) => {
        debugger
        if (e.target.value.length < 2) {
            setOptions([])
        }
        setSearch(e.target.value)
    }

    const onClose = () => {
        setSearch('')
    }

    const onKeyDown = (event) => {
        if (event.code === "Enter") {
           window.location =`/search-result/${search}/`;
        }
    }

    return (
        <>
            <Autocomplete
                value={value}
                options={options}
                autoComplete={true}
                autoSelect={true}
                onClose={onClose}
                onKeyDown={onKeyDown}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
                // onChange={onChange}
                getOptionLabel={(option) => option}
                style={{width: 300, marginRight: 40}}
                inputValue={search}
                onInputChange={(event, search) => {
                    console.log("search", search)
                    setSearch(search)
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search"
                        variant="standard"
                    />
                )}
            />
        </>
    );
}
