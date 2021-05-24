import React from "react";
import {Route} from "react-router-dom";
import MyAppBar from "./components/AppBar";
import BookList from "./components/BookList";
import BookText from "./components/bookText";
import Comments from "./components/Coments";

function App() {
    return (
        <React.Fragment>
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
