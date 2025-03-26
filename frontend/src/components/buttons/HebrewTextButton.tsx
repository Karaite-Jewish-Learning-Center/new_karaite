import { Tooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

const useStyles = makeStyles((theme) => ({
  hebrewText: {
    fontSize: 22,
    fontFamily: "SBL Hebrew",
    lineHeight: 1,
    color: ({ onOff }: { onOff: boolean }) => 
      onOff 
        ? theme.palette.type === 'dark' ? theme.palette.text.primary : theme.palette.text.primary
        : theme.palette.action.disabled,
  },
}));

export const HebrewTextButton: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) => {
  const classes = useStyles({ onOff });
  
  return (
    <Tooltip title="Toggle Hebrew Text">
      <IconButton 
        aria-label="Toggle Hebrew Text"
        component="span"
        color="inherit"
        onClick={onClick}
    >
        <span className={classes.hebrewText}>א</span>
      </IconButton>
    </Tooltip>
  );
} 