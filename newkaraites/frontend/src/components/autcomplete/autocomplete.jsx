import React, {useState, useEffect, useContext} from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import {autocompleteUrl} from '../../constants/constants'
import {storeContext} from '../../stores/context'
import {messageContext} from "../../stores/messages/messageContext";
import {useHistory} from 'react-router-dom'
import {observer} from 'mobx-react-lite'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import ImportContactsIcon from '@material-ui/icons/ImportContacts'
import {parseEnglishRef} from '../../utils/parseBiblicalReference'
import {validateBiblicalReference} from "../../utils/validateBiblicalReference";
import {isABibleBook} from "../../utils/utils";
import {makeStyles} from "@material-ui/core/styles";


const AutoComplete = () => {
    // The material-ui Autocomplete component has serious flaws
    // the documented  is not accurate or even helpful
    const store = useContext(storeContext)
    const message = useContext(messageContext)
    const [isOpen, setIsOpen] = useState(true)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState([])
    const classes = useStyles()

    let history = useHistory()

    const showResults = () => {
        if (search.length === 0) return

        if (isABibleBook(search)) {
            const {refBook, refChapter, refVerse} = parseEnglishRef(search)

            // show chapters menu
            if (refChapter === null && refVerse === null && refBook !== null) {
                store.resetPanes()
                history.push(`/Tanakh/${refBook}/`)
                return
            }
            // invalid  Biblical ref
            const validMessage = validateBiblicalReference(refBook, refChapter, refVerse)
            if (validMessage !== '') {
                message.setMessage(validMessage)
                return
            }
            // open book
            store.resetPanes()
            history.push(`/Tanakh/${refBook}/${refChapter}/${refVerse}/`)
            return
        }

        store.setSearch(search)
        if (window.location.pathname === '/search-result/') {
            // hack or page wont reload !!!
            history.push('/empty')
            history.goBack()
        } else {
            history.push('/search-result/')
        }
    }


    const onInputChange = (e, newValue) => {
        setSearch(() => newValue)
        if (newValue === '') setOptions([])
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
        const getAutoComplete = async () => {

            if (search.length < 2) return []
            if (isABibleBook(search)) return []

            const response = await fetch(`${autocompleteUrl}${search}/`)
            return await response.json()
        }

        getAutoComplete()
            .then((data) => {
                setOptions(data)
            })
            .catch(e => message.setMessage(e.message))

    }, [search, store]);

    return (

        <Autocomplete
            freeSolo
            value={search}
            open={isOpen}
            classes={{
                root: classes.root,
                inputRoot: classes.inputRoot,
                fullWidth: classes.fullWidth,
            }}
            // works around i, will be used has index to access other properties
            // of options like in renderOption and onChange
            options={options.map((option, i) => `${i}`)}
            onKeyUp={onKeyUp}
            onChange={onChange}
            getOptionLabel={(option) => option}
            style={{width: 350, marginRight: 40}}
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


const useStyles = makeStyles((theme) => ({
    root: {
        // backgroundColor: Colors['white'],
        margin: 0,
        padding: 0,
        width: '300px !important',
        [theme.breakpoints.down('xs')]: {
            width: '100px !important',
        },
    },
    inputRoot: {
        marginBottom: 15,
    },

}))

export default observer(AutoComplete)