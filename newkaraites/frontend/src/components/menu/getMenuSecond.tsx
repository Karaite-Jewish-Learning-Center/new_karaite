import React, {useState, useEffect, useContext} from 'react'
import {RenderBooksMenu} from './RenderBooksMenu';
import {RenderLiturgyMenu} from './RenderLiturgyMenu';
import {useLocation} from "react-router-dom"
import {karaitesBookByLevelAndClassification} from '../../constants/constants';
import {removeSlash} from '../../utils/utils';
import {NotFound404} from '../pages/NotFound404';
import {dataFetch} from '../api/dataFetch';
import {referenceContext} from '../../stores/references/referenceContext';


interface BookLevelClassification {
    book_id: number,
    book_first_level: string,
    book_language: string,
    book_classification: string,
    author: string,
    book_title_en: string,
    book_title_he: string,
    table_book: boolean,
    columns: number,
    columns_order: string,
    toc_columns: string,
    toc: string,
    intro: string,
    direction: 'ltr' | 'rtl | LTR | RTL',
    remove_class: string,
    remove_tags: string,
    multi_tables: boolean,
    songs_list: string[],
    buy_link: string,
    index_lag: boolean,
    better_book: boolean,
}

type DataDetails = BookLevelClassification[]

export const Second = () => {

    const [showBooks, setShowBooks] = useState<boolean>(false);
    const [books, setBooks] = useState<DataDetails>();
    const [error, setError] = useState<boolean>(false);
    const path = removeSlash(useLocation().pathname)
    const reference = useContext(referenceContext);
    const header = reference.getBreakOnClassification(path)

    useEffect(() => {
        dataFetch<DataDetails>(`${karaitesBookByLevelAndClassification}${path}/`).then(data => {
            setBooks(data)
            setShowBooks(data.length > 0)
        }).catch((e) => {
            setError(() => true)
        })
    }, [error, showBooks, path])

    if (error) return <NotFound404/>

    if(path === 'Liturgy') return (showBooks ? <RenderLiturgyMenu books={books} path={path} header={header}/> : null)

    return (showBooks ? <RenderBooksMenu books={books} path={path} header={header}/> : null)
};

export default Second