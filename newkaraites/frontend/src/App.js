import React from "react";
import {Route} from "react-router-dom";
import {makeStyles} from '@material-ui/core/styles';
import ReactTooltip from 'react-tooltip';
import MyAppBar from "./components/AppBar";
import BookList from "./components/BookList";
import BookText from "./components/bookText";
import Comments from "./components/Coments";

const useStyles = makeStyles({
  toolTipMaxWidth:{
      maxWidth:300,
  }
})

function App() {
    const classes = useStyles()

    return (
        <React.Fragment>
            <ReactTooltip  className={classes.toolTipMaxWidth} />
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

        </React.Fragment>
    );
}

export default App;
