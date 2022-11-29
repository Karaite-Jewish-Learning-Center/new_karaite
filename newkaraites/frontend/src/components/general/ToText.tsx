import {FC} from 'react'
import {Link} from "react-router-dom"
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';

interface ToTextInterface {
    to?: string;
    caption?: string;
    margin?: number;
    size?: number;
}

export const ToText: FC<ToTextInterface> = ({to = '/texts/', caption = "To texts", margin = 10, size = 20}) => {
    return (
        <div style={{ minHeight:30}}>
            <Link to={to} style={{marginBottom: margin, fontSize: size, paddingLeft: 20}}>
                {'\u2190'}{' '}{caption}
            </Link>
        </div>
    )
}


