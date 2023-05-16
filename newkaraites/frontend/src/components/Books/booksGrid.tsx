import React, {FC, useContext} from 'react'
import {TableVirtuoso} from 'react-virtuoso'
import {storeContext} from "../../stores/context";
import {observer} from 'mobx-react-lite'


interface BooksInterface {
    paneNumber: number,
}

const BooksGrid : FC<BooksInterface> = ({paneNumber}) => {
    const store = useContext(storeContext)

    return (
        <TableVirtuoso
            style={{height: '100vh'}}
            data={store.getBookBetter(paneNumber)}
            fixedHeaderContent={() => (<div>Fixed Header</div>)}
        />
    )
}

export default observer(BooksGrid)