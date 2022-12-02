import React, {useState, useEffect, useContext} from 'react'
import {RenderBooksMenu} from './RenderBooksMenu';
import {useLocation} from "react-router-dom"
import {bookDetails} from '../../types/commonTypes';
import {karaitesBookByLevelAndClassification} from '../../constants/constants';
import {removeSlash} from '../../utils/utils';
import {NotFound404} from '../pages/NotFound404';
import {fetchData} from '../api/dataFetch';
import {referenceContext} from '../../stores/references/referenceContext';

export const Second = () => {

    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<bookDetails>();
    const [error, setError] = useState<boolean>(false);
    const path = removeSlash(useLocation().pathname)
    const reference = useContext(referenceContext);
    const header = reference.getBreakOnClassification(path)

    useEffect(() => {
        fetchData(`${karaitesBookByLevelAndClassification}${path}/`).then(data => {
            debugger
            setBooks(data)
            // @ts-ignore
            setShowBooks(data.length > 0)
        }).catch((e) => {
            setError(() => true)
            console.log('error in catch',e)
        })
    }, [error, showBooks,path])

    if (error) return <NotFound404/>
    return (showBooks ? <RenderBooksMenu books={books} path={path}  header={header}/> : null)
};

export default Second