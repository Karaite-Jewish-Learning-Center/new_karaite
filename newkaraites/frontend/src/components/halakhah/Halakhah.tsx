import React, {useState} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu';
import {bookDetails} from '../../types/commonTypes';
import {HALAKHAH, karaitesBookByLevelAndClassification} from '../../constants/constants';

const fetchBooks = async (): Promise<bookDetails> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${HALAKHAH}/`);
    const data: bookDetails = await response.json();
    return data;
};


export const Halakhah = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = React.useState<bookDetails>();

    React.useEffect(() => {
        fetchBooks().then(data => {
            setBooks(data)
            setShowBooks(true);
        });
    }, []);

    return (showBooks ? <RenderBooksMenu books={books} path='halakhah' languages={['en', 'he']} header={false}/> : null)
};

export default Halakhah