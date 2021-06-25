import React from 'react';
import Select from '@material-ui/core/Select';
import {englishBook, hebrewBooks} from "../utils/utils";
import {ENGLISH, HEBREW} from "../constants";


export default function SelectBook({book, language, onSelectBookChange}) {

    const booksNames = () => {
        if (language === ENGLISH) {
            return englishBook()
        }
        if (language === HEBREW) {
            return hebrewBooks()
        }
    }
    const books = booksNames()
    return (
        <div>
            <Select
                native
                onChange={onSelectBookChange}
                dir={(language === HEBREW ? "RTL" : "LTR")}
                className={(language === HEBREW ? "hebrew-font" : "")}
                defaultValue ={book}
            >
                {books.map((bookTitle, i) => (
                    <option key={i} value={bookTitle}>{bookTitle}</option>
                ))}
            </Select>
        </div>
    )
}
