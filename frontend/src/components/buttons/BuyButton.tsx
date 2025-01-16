import React, {FC} from "react";
import ShoppingCart from "@material-ui/icons/ShoppingCart";
import IconButton from "@material-ui/core/IconButton";
import {ButtonProps} from './types';


export const BuyButton: FC<ButtonProps> = ({onClick, color}) =>
    <IconButton aria-label="Buy" style={{color: "indianred"}}
                component="span"
                color={color}
                onClick={onClick}>
        <ShoppingCart/>
    </IconButton>
