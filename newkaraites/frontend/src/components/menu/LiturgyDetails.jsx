import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useLocation} from "react-router-dom";
import {makeRandomKey} from "../../utils/utils";
import Typography from "@material-ui/core/Typography";
import {MusicBadge} from "../bages/musicBadge";
import Grid from "@material-ui/core/Grid";


const LiturgyDetails = () => {
    let {state} = useLocation();

    debugger
    const classes = useStyles()

    const Details = (obj) => {
        let keys = Object.keys({})
        let comp = []

        keys.forEach(key => {

            comp.push(
                <div className={classes.item}>
                        <span className={classes.left}>
                            <Typography className={classes.bookTitleHe}>{obj[key].book_title_he}</Typography>
                        </span>
                    <span className={classes.note}>
                             <MusicBadge length={obj[key].songs_list.length} audio={obj[key].better_book}/>
                        </span>
                    <span className={classes.right}>
                            <Typography className={classes.bookTitleEn}>
                                {obj[key].book_title_en}
                            </Typography>
                        </span>
                </div>
            )
        })

        comp.push(
            <Grid item xs={12} key={makeRandomKey()}>
                <hr className={classes.hr}/>
                <Typography variant="h6" className={classes.title}>
                </Typography>
            </Grid>
        )
        return comp
    }


    return (
        <div className={classes.container}>
            <Details obj={''}/>
        </div>
    )
}


const useStyles = makeStyles((theme) => ({
    container: {
        position: 'relative',
        margin: 'auto',
        width: '100%',
        height: '100%',
        fontSize: 28,
        top: 100,
    }
}))


export default LiturgyDetails