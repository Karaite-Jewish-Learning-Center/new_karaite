import React from "react";
import {Route} from "react-router-dom";
import MyAppBar from "./components/AppBar";
import BookList from "./components/BookList";
import Comments from "./components/Coments";

function App() {
    return (
        <div className="App">
            <MyAppBar/>
            <Route exact path="/">
                <BookList/>
            </Route>
            <Route path="/comments">
                <Comments/>
            </Route>

        </div>
    );
}

export default App;
