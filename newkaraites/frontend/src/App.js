import React from "react";
import { BrowserRouter, Route, Switch, useLocation, useParams } from "react-router-dom";
import MyAppBar from "./components/AppBar";
import FirsLevel from "./components/FirstLevel"
import Tanakh from "./components/Tanakh"
import { chaptersByBibleBook } from './constants/constants'
import ChapterMenu from './components/ChapterMenu'
import LoadBook from "./components/LoadBook";
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/core/styles'
import Halakhah from './components/Halakhah'
import { makeRandomKey } from './utils/utils'


function App() {

    const TanakhBooksLink = () => {
        let location = useLocation()
        let parts = location.pathname.split('/')
        if (parts.length === 4) {
            return Object.keys(chaptersByBibleBook).map(book =>
                <Route path={`/Tanakh/${book}/`} key={makeRandomKey()} >
                    <ChapterMenu bibleBook={book}
                        numberOfChapters={chaptersByBibleBook[book]}
                        level="Tanakh" />
                </Route>
            )
        }
        return null
    }
    const HalakhahBookLink = () => {
        return null
    }
    const Load = () => {
        let { book, chapter } = useParams()
        return (
            <LoadBook book={book} chapter={chapter} verse={1} />
        );
    }


    return (
        <ThemeProvider theme={theme}>

            <BrowserRouter>
                <MyAppBar />

                <Route exact path="/texts/">
                    <FirsLevel />
                </Route>/

                <Switch>
                    <>
                        <Route exact path="/Tanakh/:book/:chapter/" children={<Load />} />

                        <Route exact path="/Tanakh/:book/" children={<TanakhBooksLink />} />
                        <Route exact path="/Tanakh/">
                            <Tanakh />
                        </Route>

                        <Route exact path="/Halakhah/:book/" children={<HalakhahBookLink />} />
                        <Route exact path="/Halakhah/">
                            <Halakhah />
                        </Route>
                    </>
                </Switch>
            </BrowserRouter >
        </ThemeProvider>
    );
}

export default App;

const theme = createMuiTheme({
    palette: {
        primary: {
            // Purple and green play nicely together.
            main: '#ffffff',
        }
        ,
        secondary: {
            // This is green.A700 as hex.
            main: '#11c4f1',
        }
        ,
    }
    ,
}
);