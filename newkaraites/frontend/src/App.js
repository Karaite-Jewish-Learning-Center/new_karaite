import React, {useEffect} from "react";
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
import ReferenceProvider from "./stores/references/referenceContext";
import MessageProvider from "./stores/messages/messageContext";
import Message from './components/messages/Message';
import Acknowledgment from "./components/pages/Acknowledgments";
import LoadingSpin from "./components/general/LoadingSpin";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import Second from "./components/menu/getMenuSecond";


function App() {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme:dark)');
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    type: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <StoreProvider>
                <SpeechProvider>
                    <MessageProvider>
                        <ReferenceProvider>
                            <BrowserRouter>
                                <MyAppBar/>
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

                                    <Route path="/*/:book/:chapter/:verse/:intro/" children={<LoadBook type={""}/>}/>
                                    <Route path="/*/:book/:chapter/:verse/" children={<LoadBook type={""}/>}/>
                                    <Route path="/*/:book/:chapter/" children={<LoadBook type={""}/>}/>
                                    <Route path="/*/"><Second/></Route>

                                </Switch>
                            </BrowserRouter>
                        </ReferenceProvider>
                    </MessageProvider>
                </SpeechProvider>
            </StoreProvider>
        </ThemeProvider>
    );
}

export default App;

