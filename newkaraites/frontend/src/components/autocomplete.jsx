import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';


const Complete = () => {
    const onChange = (e) => {
        debugger
    }

    const onClose = (e) => {
        debugger
    }

    return (
        <>
            <Autocomplete
                options={words}
                onClose={onClose}
                autoComplete={true}
                getOptionLabel={(option) => option.word}
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

const words = [
    { word: 'Open' },
    { word: 'close' },
    { word: 'set' },
    { word: 'make' },
    { word: 'conf' },
    { word: 'dare' },
    { word: 'devil' },
    { word: 'create' },
];


export default Complete