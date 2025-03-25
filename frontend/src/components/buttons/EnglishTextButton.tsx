import IconButton from "@material-ui/core/IconButton";
import TextFieldsIcon from '@material-ui/icons/TextFields';
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

export const EnglishTextButton: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) =>
  <IconButton 
    aria-label="Toggle English Text"
    component="span"
    color={onOff ? "primary" : color}
    onClick={onClick}
  >
    <TextFieldsIcon fontSize="small" />
  </IconButton> 