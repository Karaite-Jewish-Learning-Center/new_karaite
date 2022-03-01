import {FC} from 'react'
import {Link} from "react-router-dom"

interface ToText {
    to: string;
    caption: string;
    margin: number;
    size: number;
}

export const ToText: FC<ToText> = ({to = '/texts/', caption = "To texts", margin = 0, size = 20}) =>
    <Link style={{marginBottom: margin, fontSize: size}} to={to}>{caption}</Link>

