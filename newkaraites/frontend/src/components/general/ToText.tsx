import {FC} from 'react'
import {Link} from "react-router-dom"

interface ToTextInterface {
    to: string;
    caption: string;
    margin: number;
    size: number;
}

export const ToText: FC<ToTextInterface> = ({to = '/texts/', caption = "To texts", margin = 0, size = 20}) =>
    <Link style={{marginBottom: margin, fontSize: size,paddingLeft:10, paddingRight:10 }} to={to}>{caption}</Link>

