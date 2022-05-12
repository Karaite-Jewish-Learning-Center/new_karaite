import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import MyAppBar from "./components/menu/AppBar";
import FirstLevel from "./components/menu/FirstLevel"
import Tanakh from "./components/tanakh/Tanakh"
import LoadBook from "./components/LoadBook";
import {createMuiTheme} from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import Halakhah from './components/halakhah/Halakhah'
import Liturgy from "./components/liturgy/Liturgy"
import Poetry from "./components/poetry/poetry"
import Polemic from "./components/polemic/Polemic"
import Comment from "./components/comments/comment"
import Exhortatory from "./components/Exhortatory/Exhortatory";
import Display from "./components/pages/Display";
import {TanakhBooksLink} from "./components/tanakh/TanakBooksLink";
import {HalakhahBookLink} from "./components/halakhah/HalakhahBookList";
import SearchResults from "./components/pages/SearchResults";
import StoreProvider from "./stores/context";
import {NotFound404} from "./components/pages/NotFound404";
import Message from './components/messages/Message'
import Acknowledgment from "./components/pages/Acknowledgments";


function App() {
    return (
        <StoreProvider>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <MyAppBar/>
                    <Message/>

                    <Switch>
                        <Route exact path="/">
                            <Display/>
                        </Route>

                        <Route exact path="/texts/">
                            <FirstLevel/>
                        </Route>

                        <Route exact path="/acknowledgments/">
                            <Acknowledgment/>
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
                        <Route exact path="/Liturgy/"><Liturgy/></Route>

                        <Route exact path="/Poetry/:book/1/" children={<LoadBook type="poetry"/>}/>
                        <Route exact path="/Poetry/"><Poetry/></Route>

                        <Route exact path="/Polemic/:book/1/" children={<LoadBook type="polemic"/>}/>
                        <Route exact path="/Polemic/"><Polemic/></Route>

                         <Route exact path="/Exhortatory/:book/1/" children={<LoadBook type="Exhortatory"/>}/>
                        <Route exact path="/Exhortatory/"><Exhortatory/></Route>

                        <Route exact path="/Comments/:book/:chapter/" children={<LoadBook type="comments"/>}/>
                        <Route exact path="/Comments/1/" children={<LoadBook type="comments"/>}/>
                        <Route exact path="/Comments/"><Comment/></Route>

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