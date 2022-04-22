import {MouseEventHandler} from "react";
import {PropTypes} from "@material-ui/core";

interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export interface KeyboardsProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
    open:boolean;
}

export default ButtonProps
