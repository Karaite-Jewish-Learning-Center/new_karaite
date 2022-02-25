import React, {useEffect, useState} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu'
import {bookDetails} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification, LITURGY} from '../../constants/constants';


const fetchBooks = async ():Promise<bookDetails> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${LITURGY}/`);
    const data:bookDetails = await response.json();
    return data;
};


const Liturgy = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<bookDetails>();

    useEffect(() => {
        fetchBooks().then(data => {
            setBooks(data);
            setShowBooks(true);
        });
    }, []);

    return (showBooks ? <RenderBooksMenu books={books} path='liturgy' languages={['en', 'he']}/> : null)

}


export default Liturgy