import React from "react";
import {Route, useLocation} from "react-router-dom";
import {chaptersByBibleBook} from "../../constants/constants";
import {makeRandomKey, unslug} from "../../utils/utils";
import ChapterMenu from "../menu/ChapterMenu";


export const TanakhBooksLink = () => {
    debugger
    let location = useLocation()
    let parts = location.pathname.split('/')
    if (parts.length === 4 && parts[1] === 'Tanakh') {
        return Object.keys(chaptersByBibleBook).map(book =>
            <Route path={`/Tanakh/${book}/`} key={makeRandomKey()}>
                <ChapterMenu bibleBook={book}
                             numberOfChapters={chaptersByBibleBook[unslug(book)]}
                             level="Tanakh"/>
            </Route>
        )
    }
    return null
}
