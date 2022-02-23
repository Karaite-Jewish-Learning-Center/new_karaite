import React, {useEffect, useState} from 'react'
import {RenderLiturgyMenu} from '../menu/RenderLiturgyMenu'
import {booksLiturgy} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification, LITURGY} from '../../constants/constants';


const fetchBooks = async ():Promise<booksLiturgy> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${LITURGY}/`);
    const data:booksLiturgy = await response.json();
    return data;
};


const Liturgy = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<booksLiturgy>();

    useEffect(() => {
        fetchBooks().then(data => {
            setBooks(data);
            setShowBooks(true);
        });
    }, []);

    return (showBooks ? <RenderLiturgyMenu books={books} path='liturgy' languages={['en', 'he']}/> : null)

}


export default Liturgy