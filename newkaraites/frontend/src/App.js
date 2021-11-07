import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import MyAppBar from "./components/AppBar";
import FirstLevel from "./components/FirstLevel"
import Tanakh from "./components/Tanakh"
import LoadBook from "./components/LoadBook";
import {createMuiTheme} from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import Halakhah from './components/Halakhah'
import Home from "./components/pages/Home";
import {TanakhBooksLink} from "./components/menu/TanakBooksLink";
import {HalakhahBookLink} from "./components/menu/HalakhahBookList";
import {SearchResult} from "./components/pages/SearchResult";
// import MainMenu from "./components/menu/MainMenu";
import StoreProvider from "./stores/context";
import {NotFound404} from "./components/pages/NotFound404";


function App() {

    return (
        <StoreProvider>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    {/*<MainMenu/>*/}
                    <MyAppBar/>
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                        </Route>

                        <Route exact path="/texts/">
                            <FirstLevel/>
                        </Route>

                        <Route exact path="/search-result/">
                            <SearchResult/>
                        </Route>

                        <Route exact path="/Tanakh/:book/:chapter/" children={<LoadBook type={'bible'}/>}/>
                        <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink/>}/>
                        <Route exact path="/Tanakh/"><Tanakh/></Route>

                        <Route exact path="/Halakhah/:book/:chapter/" children={<LoadBook type="karaites"/>}/>
                        <Route exact path="/Halakhah/:book/" children={<HalakhahBookLink/>}/>
                        <Route exact path="/Halakhah/"><Halakhah/></Route>

                        <Route path='*'>
                            <NotFound404/>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </ThemeProvider>
        </StoreProvider>
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