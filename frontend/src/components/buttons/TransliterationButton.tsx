import { Tooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import TranslateIcon from '@material-ui/icons/Translate';
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

const useStyles = makeStyles((theme) => ({
  icon: {
    color: ({ onOff }: { onOff: boolean }) => 
      onOff 
        ? theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.text.primary
        : theme.palette.action.disabled,
  },
}));

export const TransliterationButton: FC<ButtonPropsOnOff> = ({ onClick, color = "inherit", onOff }) => {
  const classes = useStyles({ onOff });
  return (
    <Tooltip title="Toggle Transliteration">
      <IconButton 
        aria-label="Toggle Transliteration"
        component="span"
        color="inherit"
        onClick={onClick}
      >
        <TranslateIcon fontSize="small" className={classes.icon} />
      </IconButton> 
    </Tooltip>
  );
}
  