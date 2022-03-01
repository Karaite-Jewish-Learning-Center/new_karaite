import {MouseEventHandler} from "react";
import {PropTypes} from "@material-ui/core";

interface ButtonProps {
    onClick: MouseEventHandler;
    color?: PropTypes.Color;
}

export default ButtonProps;