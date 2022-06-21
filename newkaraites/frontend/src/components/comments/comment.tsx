import React, {useState,useEffect} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu';
import {bookDetails} from '../../types/commonTypes';
import {COMMENTS, karaitesBookByLevelAndClassification} from '../../constants/constants';

const fetchBooks = async (): Promise<bookDetails> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${COMMENTS}/`);
    const data: bookDetails = await response.json();
    return data;
};


export const Comment = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = React.useState<bookDetails>();

    useEffect(() => {
        fetchBooks().then(data => {
            setBooks(data)
            setShowBooks(true);
        });
    }, []);

    return (showBooks ? <RenderBooksMenu books={books} path='Comments' languages={['en', 'he']} header={false}/> : null)
};

export default Comment