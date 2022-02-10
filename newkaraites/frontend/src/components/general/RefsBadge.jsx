import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'


export default function RefsBadge({ refsCount, color='#fff' }) {
    const classes = useStyles()
    return (
        <span style={{ 'visibility': (refsCount !== 0 ? 'visible' : 'hidden') }}>
            <Badge>
                <FiberManualRecordIcon className={classes.icon} color={color}/>
            </Badge>
        </span >
    )
}

const useStyles = makeStyles(() => ({
    icon: {
        fontSize: 8,
    },
    pointer:{
        cursor: 'pointer'
    }
}))

