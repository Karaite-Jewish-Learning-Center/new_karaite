import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import MyAppBar from "./components/AppBar";
import FirstLevel from "./components/menu/FirstLevel"
import Tanakh from "./components/tanakh/Tanakh"
import LoadBook from "./components/LoadBook";
import {createMuiTheme} from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import Halakhah from './components/halakhah/Halakhah'
import Liturgy from "./components/liturgy/Liturgy"
import Home from "./components/pages/Home";
import {TanakhBooksLink} from "./components/tanakh/TanakBooksLink";
import {HalakhahBookLink} from "./components/halakhah/HalakhahBookList";
import SearchResults from "./components/pages/SearchResults";
//import MainMenu from "./components/menu/MainMenu";
import StoreProvider from "./stores/context";
import {NotFound404} from "./components/pages/NotFound404";
import Message from './components/messages/Message'


function App() {

    return (
        <StoreProvider>

            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    {/*<MainMenu/>*/}
                    <MyAppBar/>
                    <Message/>
                    <Switch>
                        <Route exact path="/">
                            <Home/>
                        </Route>

                        <Route exact path="/texts/">
                            <FirstLevel/>
                        </Route>

                        <Route exact path="/search-result/" forceRefresh={true}>
                            <SearchResults/>
                        </Route>

                        <Route exact path="/Tanakh/:book/:chapter/:verse/" children={<LoadBook type={'bible'}/>}/>
                        <Route exact path="/Tanakh/:book/:chapter/" children={<LoadBook type={'bible'}/>}/>
                        <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink/>}/>
                        <Route exact path="/Tanakh/"><Tanakh/></Route>

                        <Route exact path="/Halakhah/:book/:chapter/" children={<LoadBook type="karaites"/>}/>
                        <Route exact path="/Halakhah/:book/" children={<HalakhahBookLink/>}/>
                        <Route exact path="/Halakhah/"><Halakhah/></Route>

                        <Route exact path="/Liturgy/:book/1/" children={<LoadBook type="liturgy"/>}/>
                        {/*<Route exact path="/Liturgy/:book/" children={<Liturgy/>}/>*/}
                        <Route exact path="/Liturgy/"><Liturgy/></Route>

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