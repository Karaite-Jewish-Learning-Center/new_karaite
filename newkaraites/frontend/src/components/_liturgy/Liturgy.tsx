import React, {useEffect, useState} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu'
import {bookDetails} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification} from '../../constants/constants';
import {NotFound404} from '../pages/NotFound404'
import {fetchData} from '../api/dataFetch';


const Liturgy = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [books, setBooks] = useState<bookDetails>();

    useEffect(() => {
        fetchData(`${karaitesBookByLevelAndClassification}Liturgy/`).then(data => {
            setBooks(data);
            setShowBooks(true);
        }).catch(_ => setError(true));
    }, []);

    if(error) return <NotFound404/>

    return (showBooks ? <RenderBooksMenu books={books} path='liturgy' languages={['en', 'he']}/> : null)

}


export default Liturgy