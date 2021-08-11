import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import MyAppBar from "./components/AppBar";
import FirsLevel from "./components/FirstLevel"
import Tanakh from "./components/Tanakh"
import { chaptersByBibleBook } from './constants/constants'
import BookText from "./components/bookText"
import ListKaraitesBooks from './components/ListKaraitesBooks'
import PresentKaraitesBooks from "./components/PresentKaraitesBook"
import Comments from "./components/Comments"
import { createMuiTheme } from '@material-ui/core/styles'
//import { ThemeProvider } from '@material-ui/styles'

import ChapterMenu from './components/ChapterMenu'
import LoadBook from "./components/LoadBook";


const tanakhBooksLink = () =>
    Object.keys(chaptersByBibleBook).map(book =>
        <Route path={`/${book}/`} >
            <ChapterMenu bibleBook={book} numberOfChapters={chaptersByBibleBook[book]} level="Tanakh"  />
        </Route>
    )


function App() {


    return (
        <BrowserRouter>
            <Switch>
                <>
                    {/* <ThemeProvider theme={theme}> */}

                    <MyAppBar />

                    <Route exact path="/">
                        <FirsLevel />
                    </Route>
                    <Route path="/Tanakh/">
                        <Tanakh />
                    </Route>

                    {tanakhBooksLink()}

                    <Route path="/bible/">
                        <LoadBook book={'Genesis'} chapter={1} verse={1} />
                    </Route>


                    {/* <Route path="/bible/">
                        <BibleBooksWithComments book={'Deuteronomy'} chapter={2} verse={9} fullBook={true} />
                    </Route> */}

                    {/* <Route path="/comments">
                        <Comments />
                    </Route>

                    <Route path="/texts">
                        <BookText book={'Deuteronomy'} />
                    </Route>

                    <Route path="/bible/">
                        <BibleBooksWithComments book={'Deuteronomy'} chapter={2} verse={9} fullBook={true} />
                    </Route>

                    <Route path="/list-karaites-books/">
                        <ListKaraitesBooks />
                    </Route>

                    <Route path="/presentation/">
                        <PresentKaraitesBooks />
                    </Route>
                    <Route path="/presentation/">
                        <PresentKaraitesBooks />
                    </Route> */}

                    {/* </ThemeProvider> */}
                </>
            </Switch>
        </BrowserRouter>
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
