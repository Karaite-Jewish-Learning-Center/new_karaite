import React, {useContext, FC} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {Grid} from '@material-ui/core'
import {unslug} from '../../utils/utils'
import Colors from '../../constants/colors'
import {observer} from 'mobx-react-lite'
import {storeContext} from '../../stores/context'
import {CloseButton} from "../buttons/CloseButton";
import {InfoButton} from "../buttons/InfoButton";
import {TocButton} from '../buttons/TocButton';
import {BookButton} from '../buttons/BookButton';

interface IProps {
    paneNumber: number,
    onClosePane: Function
    onIntroClick: Function,
    onTocClick: Function,
    onBookClick: Function,
}

const KaraitesPaneHeader: FC<IProps> = ({paneNumber, onClosePane, onIntroClick, onTocClick, onBookClick}) => {
    const store = useContext(storeContext)
    const classes = resources()

    const onClose = () => {
        onClosePane(paneNumber)
    }
    const onIntro = () => {
        onIntroClick(paneNumber)
    }
    const onToc = () => {
        onTocClick(paneNumber)
    }
    const onBook = () => {
        onBookClick(paneNumber)
    }

    return (

        <Grid container
              direction="row"
              className={classes.resources}
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}>

            <Grid item xs={5}>
                <CloseButton onClick={onClose}/>
                <InfoButton onClick={onIntro}/>
                <TocButton onClick={onToc}/>
                <BookButton onClick={onBook}/>
            </Grid>

            <Grid item xs={4}>
                <Typography>{unslug(store.getBook(paneNumber))}</Typography>
            </Grid>
        </Grid>
    )
}

const resources = makeStyles({
    resources: {
        minHeight: 50,
        backgroundColor: Colors['headerBackgroundColor'],
        padding: 0,
        marginRight: 0,
    },
    iconGrid: {
        margin: 0,
        padding: 0,

    },
    iconButton: {
        marginRight: 12
    },

})

export default observer(KaraitesPaneHeader)