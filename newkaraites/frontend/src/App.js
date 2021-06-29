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


function App() {
    const classes = useStyles()

    return (
        <ThemeProvider theme={theme}>
            <ReactTooltip id='en' className={classes.english} place="top"/>
            <ReactTooltip id='he' className={classes.hebrew} place="bottom"/>
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

// tooltips
const useStyles = makeStyles({
    english: {
        maxWidth: 300,
    },
    hebrew:{
      maxWidth: 300,
      direction:'rtl',
    }
})
