import React from 'react'
import { booksMenu } from '../constants/common-css'
import RenderMenu from './RenderMenu'

const halakhah = {
    'Yeriot Shelomo Volume 1': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד אד',
    'Yeriot Shelomo Volume 2': 'לורם איפסום דולור סיט אמט, קונסקטורר אדיפיסינג אלית קולורס מונפרד א',
}

const books = { 'Halakhah': halakhah }

const Halakhah = () => {
    const classes = booksMenu()

    return (
        <div>
            <div className={classes.filler}>&nbsp;</div>
            <RenderMenu books={books} />
        </div>
    )

}


export default Halakhah