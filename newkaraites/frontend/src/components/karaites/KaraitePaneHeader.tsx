import React, {useContext, FC} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {Grid} from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {unslug} from '../../utils/utils'
import {storeContext} from '../../stores/context'
import {CloseButton} from "../buttons/CloseButton";
import {InfoButton} from "../buttons/InfoButton";
import {TocButton} from '../buttons/TocButton';
import {BookButton} from '../buttons/BookButton';
import {BuyButton} from '../buttons/BuyButton';
import {MusicSelect} from '../buttons/music-select';
import {iOS} from '../../utils/utils';


interface IProps {
    paneNumber: number,
    onClosePane: Function
    onIntroClick: Function,
    onTocClick: Function,
    onBookClick: Function,
    details: any,
}

const KaraitesPaneHeader: FC<IProps> = ({
                                            paneNumber,
                                            onClosePane,
                                            onIntroClick,
                                            onTocClick,
                                            onBookClick,
                                            details
                                        }) => {

    const store = useContext(storeContext)
    const classes = useStyles()
    const matches = useMediaQuery('(min-width:600px)');
    const direction = (matches ? 'row' : 'column')
    const xsColumns1 = (matches ? 5 : 12)
    const xsColumns2 = (matches ? 4 : 12)

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
    const onBuy = () => {
        window.open(details.buy_link)
    }
    return (
        <Grid container
              direction={direction}
              className={classes.resources}
              justifyContent="flex-start"
              alignItems="center"
              spacing={1}>

            <Grid item xs={xsColumns1}>
                <CloseButton onClick={onClose}/>
                <InfoButton onClick={onIntro}/>
                <TocButton onClick={onToc}/>
                <BookButton onClick={onBook}/>
                <MusicSelect songs={details.songs_list}/>
                {(details.buy_link === '' ? null : <BuyButton onClick={onBuy}/>)}
            </Grid>

            <Grid item xs={xsColumns2}>
                <Typography>{unslug(store.getBook(paneNumber))}</Typography>
            </Grid>
        </Grid>
    )
}

const useStyles = makeStyles({
    resources: {
        minHeight: 50,
        padding:0,
        paddingTop: (iOS() ? 50 : 0),
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

export default KaraitesPaneHeader