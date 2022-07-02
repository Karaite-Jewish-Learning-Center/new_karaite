import React, {useState, useEffect} from 'react'
import {RenderBooksMenu} from '../menu/RenderBooksMenu';
import {useLocation} from "react-router-dom"
import {bookDetails} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification} from '../../constants/constants';
import {removeSlash} from '../../utils/utils';
import {NotFound404} from '../pages/NotFound404';
import {fetchData} from '../api/dataFetch';

export const Second = () => {
    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<bookDetails>();
    const [error, setError] = useState<boolean>(false);
    const path = removeSlash(useLocation().pathname)

    useEffect(() => {
        fetchData(`${karaitesBookByLevelAndClassification}${path}/`).then(data => {
            setBooks(data)
            // @ts-ignore
            setShowBooks(data.length > 0)
        }).catch((e) => {
            setError(() => true)
            console.log('error in catch',e)
        })
    }, [error, showBooks])

    if (error) return <NotFound404/>
    return (showBooks ? <RenderBooksMenu books={books} path={path} languages={['en', 'he']} header={path === 'Liturgy'}/> : null)
};

export default Second