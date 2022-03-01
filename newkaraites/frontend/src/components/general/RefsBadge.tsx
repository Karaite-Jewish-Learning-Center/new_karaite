import {FC} from 'react'
import Badge from '@material-ui/core/Badge'
import {makeStyles} from '@material-ui/core/styles'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'

interface RefsBadgeProps {
    refsCount: number,
    color?: any
}

const RefsBadge: FC<RefsBadgeProps> = ({refsCount, color = '#fff'}) => {
    const classes = useStyles()
    return (
        <span style={{'visibility': (refsCount !== 0 ? 'visible' : 'hidden')}}>
            <Badge>
                <FiberManualRecordIcon className={classes.icon} color={color}/>
            </Badge>
        </span>
    )
}

const useStyles = makeStyles(() => ({
    icon: {
        fontSize: 8,
    },
    pointer: {
        cursor: 'pointer'
    }
}))

export default RefsBadge
