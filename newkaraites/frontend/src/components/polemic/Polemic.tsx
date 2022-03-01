import React, {useState} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu';
import {bookDetails} from '../../types/commonTypes';
import {POLEMIC, karaitesBookByLevelAndClassification} from '../../constants/constants';


// todo: merge liturgy, halakhah and polemic in on component

const fetchBooks = async (): Promise<bookDetails> => {
    const response = await fetch(`${karaitesBookByLevelAndClassification}${POLEMIC}/`);
    const data: bookDetails = await response.json();
    return data;
};


export const Polemic = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = React.useState<bookDetails>();

    React.useEffect(() => {
        fetchBooks().then(data => {
            setBooks(data)
            setShowBooks(true);
        });
    }, []);

    return (showBooks ? <RenderBooksMenu books={books} path='polemic' languages={['en', 'he']} header={false}/> : null)
};

export default Polemic