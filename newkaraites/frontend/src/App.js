import React from "react";
import {BrowserRouter, Route, Switch, useParams} from "react-router-dom";
import MyAppBar from "./components/AppBar";
import FirstLevel from "./components/FirstLevel"
import Tanakh from "./components/Tanakh"
import LoadBook from "./components/LoadBook";
import {createMuiTheme} from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import Halakhah from './components/Halakhah'
import Home from "./components/pages/Home";
import store from "./stores/appState";
import {TanakhBooksLink} from "./components/menu/TanakBooksLink";
import {HalakhahBookLink} from "./components/menu/HalakhahBookList";
import {SearchResult} from "./components/pages/SearchResult";
// import MainMenu from "./components/menu/MainMenu";


function App() {

    const Load = ({type}) => {
        store.resetPanes()
        let {book, chapter} = useParams()
        return (
            <LoadBook book={book} chapter={chapter} verse={1} type={type}/>
        );
    }

    return (
        <ThemeProvider theme={theme}>

            <BrowserRouter>
                {/*<MainMenu/>*/}
                <MyAppBar/>
                <Route exact path="/">
                    <Home/>
                </Route>

                <Route exact path="/texts/">
                    <FirstLevel/>
                </Route>

                <Route exact path="/search-result/">
                    <SearchResult search={'god'}/>
                </Route>

                <Switch>
                    <>
                        <Route exact path="/Tanakh/:book/:chapter/" children={<Load type="bible"/>}/>
                        <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink/>}/>
                        <Route exact path="/Tanakh/"><Tanakh/></Route>

                        <Route exact path="/Halakhah/:book/:chapter/" children={<Load type="karaites"/>}/>
                        <Route exact path="/Halakhah/:book/" children={<HalakhahBookLink/>}/>
                        <Route exact path="/Halakhah/"><Halakhah/></Route>
                    </>
                </Switch>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;

const theme = createMuiTheme({
        palette: {
            primary: {
                main: '#ffffff',
            },
            secondary: {
                main: '#11c4f1',
            },

        },
    }
);