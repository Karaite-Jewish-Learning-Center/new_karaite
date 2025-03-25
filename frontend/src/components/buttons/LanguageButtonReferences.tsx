import {FC} from "react"
import IconButton from "@material-ui/core/IconButton"
import {observer} from "mobx-react-lite"
import {makeStyles} from '@material-ui/core/styles'
import {LANGUAGE_KEY, LANGUAGE_SYMBOL} from "../../constants/constants"
import {langButtonReference} from './types';


const LanguageButton: FC<langButtonReference> = ({language, onClick}) => {
    const classes = useStyles()

    if(language.length === 0)  return null

    return <IconButton
        aria-label="select language"
        component="span"
        className={classes.langButton}
        onClick={onClick}>
        {LANGUAGE_SYMBOL[LANGUAGE_KEY[language]]}
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