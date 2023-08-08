import React from "react";
import {liturgyUrl, makeRandomKey} from "../../utils/utils";
import {Link} from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import {MusicBadge} from "../bages/musicBadge";


const liturgyMenuItems = (obj, classes, path, classifications) => {
    let comp = []
    let keys = Object.keys(obj)

    keys.forEach(key => {
        if (classifications.data === obj[key].book_classification) {
            const url = liturgyUrl(obj[key].book_title_en, obj[key].better_book, path)
            comp.push(
                <Link to={url} key={makeRandomKey()}>
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
                </Link>
            )
        }

    })
    return comp
}

export default liturgyMenuItems
