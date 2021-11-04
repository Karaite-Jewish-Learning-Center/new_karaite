import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {autocompleteUrl} from '../../constants/constants'


const Complete = () => {
     const [value, setValue] = useState(null);
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState([])

    const getAutoComplete = async () => {
        if (search.length < 2) return undefined
        const response = await fetch(`${autocompleteUrl}${search}/`)
        if (response.ok) {
            const data = await response.json()
            setOptions(data)
        } else {
            alert("HTTP-Error: " + response.status)
        }
    }

    useEffect(() => {
        getAutoComplete()
    }, [search]);


    const onChange = (e) => {
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
            console.log('Key', event)
        }
    }

    return (
        <>
            <p>The search:{search}</p>
             <p>Value:{value}</p>
            <Autocomplete
                value ={value}
                options={options}
                autoComplete={true}
                onClose={onClose}
                onKeyDown={onKeyDown}
                onChange={(event, newValue) => {
                    setValue(newValue);
                }}
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


export default Complete