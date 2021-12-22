import React from 'react'
import {RenderHalakhahMenu} from './RenderHalakhahMenu'
import {booksHalakhah, booksMenuHalakhah} from '../../types/commonTypes'


// this will be an api call !
const halakhah: booksHalakhah = {
    'Yeriot Shelomo': {
        'HebrewName': 'יריעות שלמה',
        'Author':'R. Shelomo Afeda Ha-Kohen / ר שלמה אפידה הכהן',
        'Date Written': '1860',
        'Location': 'Constantinople / קושטא',
        'Edition': 'Ramla 1986',
    },
    // 'Yeriot Shelomo Volume 2': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד א',
    // 'Halakha Adderet': 'שכל דת ליום התוכן. של עמוד דרכה היא, אנא אם החול יידיש ב',
}

//const books: booksMenuHalakhah = {'Halakhah': halakhah}

const Halakhah = () => <p>Halakhah</p> // <RenderHalakhahMenu books={books} path={'Halakhah'} languages={['en', 'he']}/>

export default Halakhah