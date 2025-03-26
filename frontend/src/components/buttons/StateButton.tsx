import { IconButton, makeStyles, Tooltip } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  hebrewText: {
    fontSize: 18,
    fontFamily: "SBL Hebrew",
    fontWeight: "bold",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    textAlign: "center",
  },
  englishText: {
    fontSize: 18,
    fontFamily: "SBL Hebrew",
    fontWeight: "bold",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    textAlign: "center",
  },
  transliterationText: {
    fontSize: 18,
    fontFamily: "SBL Hebrew",
    fontWeight: "bold",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    textAlign: "center",
  },
  allText: {
    fontSize: 18,
    fontFamily: "SBL Hebrew",
    fontWeight: "bold",
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
    textAlign: "center",
  },
}));

export const StateButton = ({ state, onClick }: { state: string; onClick: () => void }) => {
    const label = "Show text in Hebrew, English, or Transliteration"
    let css_class = ""
    let text = ""
    const classes = useStyles();

    switch (state) {
        case "hebrew":
            css_class = classes.hebrewText
            text = "א"
            break
        case "english":
            css_class = classes.englishText
            text = "E"
            break
        case "transliteration":
            css_class = classes.transliterationText
            text = "Tt"
            break
        case "all":
            css_class = classes.allText
            text = "All"
            break
        default:
            console.log("Invalid state")
    }
    
    return (
        <Tooltip title={label}>
            <IconButton
                aria-label={label}
                component="span"
                onClick={onClick}
            >
                <span className={css_class}>{text}</span>
            </IconButton>
        </Tooltip>
        );
    } 