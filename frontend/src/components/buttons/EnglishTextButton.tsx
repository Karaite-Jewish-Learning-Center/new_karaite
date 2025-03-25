import { makeStyles, Tooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

const useStyles = makeStyles((theme) => ({
  englishText: {
    fontSize: 18,
    fontFamily: "SBL Hebrew",
    color: ({ onOff }: { onOff: boolean }) => 
      onOff 
        ? theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.text.primary
        : theme.palette.action.disabled,
  },
}));

export const EnglishTextButton: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) => {
  const classes = useStyles({ onOff });
  return (
  <Tooltip title="Toggle English Text">
    <IconButton 
      aria-label="Toggle English Text"
      component="span"
      color="inherit"
      onClick={onClick}
    >
      <span className={classes.englishText}>E</span>
    </IconButton> 
  </Tooltip>
  )
}
