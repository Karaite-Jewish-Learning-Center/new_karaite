import CommentTwoToneIcon from '@material-ui/icons/CommentTwoTone';
import Badge from '@material-ui/core/Badge';
import {makeStyles} from '@material-ui/core/styles'

export default function CommentBadge({commentsCount, sameChapterAndVerse}) {
    const classes = useStyles()
    let count = parseInt(commentsCount)
    if ( count !== 0) {
        return (
            <span className="tip-bottom" data-for='en' data-tip={"Click to read " + (count === 1 ? 'this comment' : 'these comments')}>
                <Badge badgeContent={commentsCount}
                       color={(sameChapterAndVerse ? "error" : "secondary")}
                       anchorOrigin={{vertical: 'top', horizontal: 'left'}}
                >
                    <CommentTwoToneIcon/>
                </Badge>
            </span>
        )
    }
    return (<span className={classes.fill}>
                <Badge>
                    <CommentTwoToneIcon/>
                </Badge>
          </span>)
}

const useStyles = makeStyles(() => ({
    fill: {
        visibility: 'hidden',
    },

}))

