import React from 'react'
import RenderMenu from './RenderMenu'

// this will be an api call !
const halakhah = {
    'Yeriot Shelomo Volume 1': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד אד',
    'Yeriot Shelomo Volume 2': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד א',
}

const books = {'Halakhah': halakhah}

const Halakhah = () => <RenderMenu books={books} path={'Halakhah'} languages={['en', 'he']}/>

export default Halakhah