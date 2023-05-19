import React, {FC, useContext} from 'react'
import {TableVirtuoso} from 'react-virtuoso'
import {storeContext} from "../../stores/context";
import {observer} from 'mobx-react-lite'


interface BooksInterface {
    paneNumber: number,
    bookData :any[]
}

const BookGrid: FC<BooksInterface> = ({paneNumber, bookData}) => {

    // if(bookData === undefined || bookData.length === 0) return null;

    return( <p>Ei</p>)
    // const itemContent = (index: number, data: any): any => {
    //     console.log(index, data)
    // }
    //
    // if(bookData ===undefined || bookData.length===0) return null
    //
    // return (
    //         <TableVirtuoso
    //             style={{height: '100vh'}}
    //             data={bookData}
    //             itemContent={itemContent}
    //             fixedHeaderContent={() => (<tr>{"Header"} </tr>)}
    //         />
    // )
}

export default BookGrid