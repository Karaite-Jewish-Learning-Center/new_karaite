import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'


export default function CommentBadge({ commentsCount, sameChapterAndVerse }) {
    const classes = useStyles()
    let count = parseInt(commentsCount)
    if (count !== 0) {
        return (
            <span>
                <Badge>
                    <FiberManualRecordIcon className={classes.icon} />
                </Badge>
            </span>
        )
    }
    return (<span className={classes.fill}>
        <Badge>
            <FiberManualRecordIcon className={classes.icon} />
        </Badge>
    </span>)
}

const useStyles = makeStyles(() => ({
    fill: {
        visibility: 'hidden',
    },
    icon: {
        fontSize: 8,
    },
}))

