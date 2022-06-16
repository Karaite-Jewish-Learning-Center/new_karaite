import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import MyAppBar from "./components/menu/AppBar";
import FirstLevel from "./components/menu/FirstLevel"
import Tanakh from "./components/tanakh/Tanakh"
import LoadBook from "./components/LoadBook";
import {createTheme} from '@material-ui/core/styles'
import {ThemeProvider} from '@material-ui/core/styles'
import Display from "./components/pages/Display";
import {TanakhBooksLink} from "./components/tanakh/TanakBooksLink";
import SearchResults from "./components/pages/SearchResults";
import StoreProvider from "./stores/context";
import SpeechProvider from "./stores/ttspeechContext";
import MessageProvider from "./stores/messages/messageContext";
import {NotFound404} from "./components/pages/NotFound404";
import Message from './components/messages/Message';
import Acknowledgment from "./components/pages/Acknowledgments";
import LoadingSpin from "./components/general/LoadingSpin";
// import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import Second from "./components/menu/getMenuSecond";

function App() {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#ffffff',
            },
            secondary: {
                main: '#11c4f1',
            },

        },
    });
    // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');
    //
    // const theme = React.useMemo(
    //     () =>
    //         createTheme({
    //             palette: {
    //                 type: prefersDarkMode ? 'dark' : 'light',
    //             },
    //         }),
    //     [prefersDarkMode],
    // );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <StoreProvider>
                <SpeechProvider>
                    <MessageProvider>
                        <BrowserRouter>
                            <MyAppBar theme={theme}/>
                            <Message/>
                            <LoadingSpin/>
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

                                <Route exact path="/Tanakh/:book/:chapter/:verse/" children={
                                    <LoadBook type={'bible'}/>}/>
                                <Route exact path="/Tanakh/:book/:chapter/" children={<LoadBook type={'bible'}/>}/>
                                <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink/>}/>
                                <Route exact path="/Tanakh/"><Tanakh/></Route>

                                <Route path="/*/:book/1/" children={<LoadBook type={""}/>}/>
                                <Route path="/*/"><Second/></Route>

                                <Route path='*'>
                                    <NotFound404/>
                                </Route>
                            </Switch>
                        </BrowserRouter>
                    </MessageProvider>
                </SpeechProvider>
            </StoreProvider>
        </ThemeProvider>
    );
}

export default App;

