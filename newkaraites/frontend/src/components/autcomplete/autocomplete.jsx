import React, {useState, useEffect, useContext} from 'react'
import {Redirect} from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {autocompleteUrl} from '../../constants/constants'
import {apiFetch} from '../api/apiFetch'
import {storeContext} from '../../stores/context'
import {useHistory} from 'react-router-dom'
import {observer} from 'mobx-react-lite'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import ImportContactsIcon from '@material-ui/icons/ImportContacts'
import {parseEnglishRef} from '../../utils/parseBiblicalReference'


const AutoComplete = () => {
    // The material-ui Autocomplete component has serious flaws
    // the documented  is not accurate or even help full
    const store = useContext(storeContext)
    const [isOpen, setIsOpen] = useState(true)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState([])
    const [isBook, setIsBook] = useState(false)
    let history = useHistory()

    const getAutoComplete = async () => {

        if (search.length < 2) return
        if (isBook) return

        apiFetch(`${autocompleteUrl}${search}/`)
            .then((response) => {
                setOptions(response)
            })
            .catch(e => console.log(e))
    }


    const showResults = () => {
        debugger
        if (isBook) {
            const {refBook, refChapter, refVerse} = parseEnglishRef(search)
            history.push(`/Tanakh/${refBook}/${refChapter}/${refVerse}/`)
        }

        if (search.length === 0) return

        if (store.getSearch() !== search || window.location.pathname !== '/search-result/') {
            store.setSearch(search)
            history.push('/search-result/')
        }
    }

    const onInputChange = (e, newValue) => {
        if (options[0] !== undefined && options[0].c === 'B' && options[0].w.length <= newValue.length) {
            setIsBook(() => true)
        } else {
            setIsBook(() => false)
        }
        setSearch(() => newValue)
    }

    const onKeyUp = (event) => {
        if (event.code === "Enter") {
            setIsOpen(() => false)
            showResults()
        } else {
            setIsOpen(true)
        }
    }

    const onChange = (e, value, reason) => {
        if (reason === 'select-option') {
            setSearch(() => options[value].w)
        }
    }


    useEffect(() => {
        getAutoComplete()
    }, [search]);

    return (
        <Autocomplete
            freeSolo
            value={search}
            open={isOpen}
            // works around i, will be used has index to access other properties
            // of options like in renderOption and onChange
            options={options.map((option, i) => `${i}`)}
            onKeyUp={onKeyUp}
            onChange={onChange}
            getOptionLabel={(option) => option}
            style={{width: 300, marginRight: 40}}
            inputValue={search}
            onInputChange={onInputChange}
            renderOption={(i) =>
                <>
                    {(options[i].c === 'V' ? <ImportContactsIcon/> : <MenuBookIcon/>)}
                    <span>{' '}{options[i].w}</span>
                </>
            }
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

export default observer(AutoComplete)