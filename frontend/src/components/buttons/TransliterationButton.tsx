import IconButton from "@material-ui/core/IconButton";
import TranslateIcon from '@material-ui/icons/Translate';
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

export const TransliterationButton: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) =>
  <IconButton 
    aria-label="Toggle Transliteration"
    component="span"
    color={onOff ? "primary" : color}
    onClick={onClick}
  >
    <TranslateIcon fontSize="small" />
  </IconButton> 