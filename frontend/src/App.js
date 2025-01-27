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
import AudioBookProvider from "./stores/audioBookContext";
import ReferenceProvider from "./stores/references/referenceContext";
import MessageProvider from "./stores/messages/messageContext";
import Message from './components/messages/Message';
import Acknowledgment from "./components/pages/Acknowledgments";
import LoadingSpin from "./components/general/LoadingSpin";
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CssBaseline from '@material-ui/core/CssBaseline';
import Second from "./components/menu/getMenuSecond";
import ReactGA from 'react-ga';
import Track from "./components/analytics/track";



// ReactGA.initialize("G-1JBZBTTCSV", {
//     // debug: true,
//     titleCase: false,
//     siteSpeedSampleRate: 100,
//     gaOptions: {
//         userId: 100
//     }
// });

const NullComponent = () => null;

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
                <AudioBookProvider>
                    <SpeechProvider>
                        <MessageProvider>
                            <ReferenceProvider>
                                <BrowserRouter>
                                    <MyAppBar/>
                                    <Message/>
                                    {/*<LoadingSpin/>*/}
                                    <Track/>
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
                                            <LoadBook type='bible'/>}/>
                                        <Route exact path="/Tanakh/:book/:chapter/" children={
                                            <LoadBook type='bible'/>}/>
                                        <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink/>}/>
                                        <Route exact path="/Tanakh/"><Tanakh/></Route>

                                        {/* better format should replace all other formats on the long run */}
                                        <Route exact path="/book/:book/" children={<LoadBook type='better'/>}/>

                                        {/* classification, Liturgy, commentary, etc. */}
                                        <Route path="/*/:book/:chapter/:verse/:intro/" children={
                                            <LoadBook type="karaites"/>}/>

                                        <Route path="/*/:book/:chapter/:verse/" children={<LoadBook type="karaites"/>}/>
                                        <Route path="/*/:book/:chapter/" children={<LoadBook type="karaites"/>}/>

                                        {/* hack to avoid 404 in autocomplete */}
                                        <Route exact path="/empty/"><NullComponent/></Route>

                                        <Route path="/*/"><Second/></Route>

                                    </Switch>
                                </BrowserRouter>
                            </ReferenceProvider>
                        </MessageProvider>
                    </SpeechProvider>
                </AudioBookProvider>
            </StoreProvider>
        </ThemeProvider>
    );
}

export default App;

