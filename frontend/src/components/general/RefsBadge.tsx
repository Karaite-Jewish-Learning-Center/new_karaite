import {FC} from 'react'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'

interface RefsBadgeProps {
    refsCount: number,
    color?: any
}

const RefsBadge: FC<RefsBadgeProps> = ({refsCount, color = 'secondary'}) =>
    <FiberManualRecordIcon
        color={color}
        style={{'visibility': (refsCount !== 0 ? 'visible' : 'hidden'), 'fontSize': 8, 'cursor': 'pointer'}}
    />

export default RefsBadge
