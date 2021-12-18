import React from 'react'
import RenderMenu from '../menu/RenderMenu'
import {booksObj, booksMenu} from '../../types/commonTypes'


// this will be an api call !
const halakhah: booksObj = {
    'Yeriot Shelomo Volume 1': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד אד',
    'Yeriot Shelomo Volume 2': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד א',
    'Halakha Adderet': 'שכל דת ליום התוכן. של עמוד דרכה היא, אנא אם החול יידיש ב',
}

const books: booksMenu = {'Halakhah': halakhah}

const Halakhah = () => <RenderMenu books={books} path={'Halakhah'} languages={['en', 'he']}/>

export default Halakhah