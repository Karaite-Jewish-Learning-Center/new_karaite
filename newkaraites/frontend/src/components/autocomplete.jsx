import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { autocompleteUrl } from '../constants/constants';



const Complete = () => {
    const [head, setHead] = useState([])
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState([])

    const getAutoComplete = async () => {
        let lookup = search
        if (search.length < 2 || search.endsWith(' ')) return undefined
        if (search.includes(' ') && !search.endsWith(' ')) {
            let parts = search.split(' ')
            lookup = parts.pop()
            setHead(parts)
        }

        const response = await fetch(`${autocompleteUrl}${lookup}/`)
        if (response.ok) {
            const data = await response.json()
            setOptions(data.map(item => head.join(' ') + ' ' + item))
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
            setHead([])
        }
        setSearch(e.target.value)
    }

    const onClose = () => {
        setSearch('')
    }



    return (
        <>
            <Autocomplete
                options={options}
                autoComplete={true}
                onClose={onClose}
                getOptionLabel={(option) => option}
                style={{ width: 300, marginRight: 40 }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search"
                        variant="standard"
                        onChange={onChange}
                    />
                )}
            />
        </>
    );
}


export default Complete