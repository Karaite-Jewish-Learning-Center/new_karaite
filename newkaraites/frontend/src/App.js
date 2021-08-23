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
import { slug } from './utils/utils'
import Halakhah from './components/Halakhah'



function App() {

    const TanakhBooksLink = () => {
        let location = useLocation()
        let parts = location.pathname.split('/')
        debugger
        if (parts.length === 3) {
            return Object.keys(chaptersByBibleBook).map(book =>
                <Route path={`/${slug(book)}/`} >
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
    const Child = () => {
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

                <Route path="/Tanakh/">
                    <Tanakh />
                </Route>

                <Route path="/Halakhah/">
                    <Halakhah />
                </Route>
                <Switch>
                    <>
                        <Route path="/:book/:chapter/" children={<Child />} />

                        <Route path="/:book/" children={<TanakhBooksLink />} />

                        {/* <Route path="/Halakhah/:book/" children={<HalakhahBookLink />} /> */}
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