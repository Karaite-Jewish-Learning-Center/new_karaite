import React, {useState} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu';
import { useLocation } from "react-router-dom"
import {bookDetails} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification} from '../../constants/constants';
import {removeSlash} from '../../utils/utils';
import {NotFound404} from '../pages/NotFound404';

const fetchBooks = async (path:string): Promise<bookDetails> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${path}/`);
    const data: bookDetails = await response.json();
    return data;
};


export const Second = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<bookDetails>();
    const path = removeSlash(useLocation().pathname)

    React.useEffect(() => {
        fetchBooks(path).then(data => {
            setBooks(data)
            // @ts-ignore
            setShowBooks(data.length > 0)

        })
    }, [])
    return (showBooks ? <RenderBooksMenu books={books} path={path} languages={['en', 'he']} header={path ==='Liturgy'}/> :  <NotFound404/>)
};

export default Second