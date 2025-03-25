import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import { FC } from "react";
import { ButtonPropsOnOff } from './types';

const useStyles = makeStyles(() => ({
  hebrewText: {
    fontSize: 16,
    fontFamily: "SBL Hebrew",
    fontWeight: "bold",
    lineHeight: 1,
  },
}));

export const HebrewTextButton: FC<ButtonPropsOnOff> = ({onClick, color="inherit", onOff}) => {
  const classes = useStyles();
  
  return (
    <IconButton 
      aria-label="Toggle Hebrew Text"
      component="span"
      color={onOff ? "primary" : color}
      onClick={onClick}
    >
      <span className={classes.hebrewText}>א</span>
    </IconButton>
  );
} 