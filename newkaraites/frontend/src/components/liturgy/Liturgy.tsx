import React from 'react'
import RenderMenu from '../menu/RenderMenu'
import {booksObj, booksMenu} from '../../types/commonTypes'

// this will be an api call !
const liturgy:booksObj = {
    'Anochi Aliyyot Poems':'When Recited: Parashat Yitro and Parashat Va’etḥanan'
}

const books:booksMenu = {'Liturgy': liturgy}

const Liturgy = () => <RenderMenu books={books} path={'liturgy'} languages={['en', 'he']} columns={12}/>

export default Liturgy