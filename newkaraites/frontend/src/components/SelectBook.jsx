import React, {useState, useEffect} from 'react';
import Select from '@material-ui/core/Select';
import {englishBook, hebrewBooks} from "../utils/utils";
import {LANGUAGE, ENGLISH, HEBREW} from "../constants";


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
                value={book}
                onChange={onSelectBookChange}
                dir={(language === HEBREW ? "RTL" : "LTR")}
            >
                {books.map((bookTitle, i) => (
                    <option key={i} value={bookTitle}  selected={bookTitle===book}>{bookTitle}</option>
                ))}
            </Select>
        </div>
    )
}
