import React, {FC, useContext, useState} from "react"
import IconButton from "@material-ui/core/IconButton"
import {observer} from "mobx-react-lite"
import {makeStyles} from '@material-ui/core/styles'
import {LANGUAGE_KEY, LANGUAGE_SYMBOL} from "../../constants/constants"
import {storeContext} from "../../stores/context"

interface langButton {
    paneNumber: number,
    lang: string[]
}

const LanguageButton: FC<langButton> = ({paneNumber, lang}) => {
    const [language, setLanguage] = useState<string[]>(lang)
    const store = useContext(storeContext)
    const classes = useStyles()

    const onClick = () => {

        // setLanguage((language)=>language.push(language.shift()))
    }


    return <IconButton
        aria-label="select language"
        component="span"
        className={classes.langButton}
        onClick={onClick}>
        {LANGUAGE_SYMBOL[LANGUAGE_KEY[store.getLanguage(paneNumber)]]}
    </IconButton>

}

const useStyles = makeStyles((theme) => ({
    langButton: {
        minWidth: 48,
        minHeight: 48,
        fontFamily: "SBL Hebrew",
        fontSize: 18,
        lineHeight: 0,
        padding: 1,
    }
}));

export default observer(LanguageButton)