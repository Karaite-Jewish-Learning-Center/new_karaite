import React from "react";
import {Route} from "react-router-dom";
import {makeStyles} from '@material-ui/core/styles';
import ReactTooltip from 'react-tooltip';
import MyAppBar from "./components/AppBar";
import BookList from "./components/BookList";
import BookText from "./components/bookText";
import Comments from "./components/Coments";
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      // Purple and green play nicely together.
      main: '#ffffff',
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#11c4f1',
    },
  },
});

const useStyles = makeStyles({
    toolTipMaxWidth: {
        maxWidth: 300,
    }
})

function App() {
    const classes = useStyles()

    return (
        <ThemeProvider theme={theme}>
            <ReactTooltip  className={classes.toolTipMaxWidth} html={true}/>
            <MyAppBar/>

            <Route exact path="/">
                <BookList/>
            </Route>

            <Route path="/comments">
                <Comments/>
            </Route>

            <Route path="/texts">
                <BookText book={'Deuteronomy'}/>
            </Route>

        </ThemeProvider>
    );
}

export default App;
