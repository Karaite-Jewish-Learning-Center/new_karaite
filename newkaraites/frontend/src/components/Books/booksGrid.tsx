import React, {FC, useContext, useRef} from 'react'
import {Virtuoso} from 'react-virtuoso'
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {storeContext} from "../../stores/context";
import {observer} from 'mobx-react-lite'
import {toJS} from 'mobx'


const HEBREW = 0
const TRANSLITERATION = 1
const ENGLISH = 2

interface BooksInterface {
    paneNumber: number,
    bookData: any[]
}

const BookGrid: FC<BooksInterface> = ({paneNumber, bookData}) => {
    const classes = useStyles()
    const virtuoso = useRef(null)
    // if (bookData === undefined || bookData.length === 0) return null;

    const itemContent = (index: number, data: any): any => {
        // console.log('index', index, 'data', data)
        // separator between hebrew/transliteration and english
        // if (data.book_text.every((e: string) => e === "")) return (<p className={classes.spacer}>&nbsp;</p>)

        // if (data.book_text[ENGLISH] !== "") {
        //     return (
        //         <div className={classes.english}>
        //             <Typography variant="body1" className={classes.english}>
        //                 {data.book_text[ENGLISH]}
        //             </Typography>
        //         </div>
        //     )
        //
        // } else {
            return (
                <div className={classes.paragraph}>
                    <Typography variant="body1" className={classes.hebrew}>
                        {data.book_text[HEBREW]}
                    </Typography>
                    <Typography variant="body1" className={classes.transliteration}>
                        {data.book_text[TRANSLITERATION]}
                    </Typography>
                     <Typography variant="body1" className={classes.english}>
                        {data.book_text[ENGLISH]}
                    </Typography>
                    {index}
                </div>
            )
        // }
    }


    return (

            <Virtuoso
                className={classes.table}
                // defaultItemHeight={200}
                ref={virtuoso}
                data={bookData}
                // atBottomThreshold={200}
                // useWindowScroll={true}
                itemContent={itemContent}
                components={{
                    Footer: () => {
                        return (
                            <div style={{padding: '1rem', textAlign: 'center'}}>
                                Book end.
                            </div>
                        )
                    }
                }}

                // fixedHeaderContent={() => (<tr className={classes.header}>{'Header'} </tr>)}
                followOutput={(isAtBottom: boolean) => (!isAtBottom ? 'smooth' : false)}
            />
    )
}

export default BookGrid


const useStyles = makeStyles((theme) => ({
    container: {
        margin: 'auto',
        width: '95vw',
        height: '80vh',
         border: '1px solid red',
        // backgroundColor: 'lightblue',
    },
    table: {
        // top:100,
        border: '1px solid black',
        // backgroundColor: 'lightyellow',
    },

    paragraph: {
        width: '100%',
        // find the reason why this is needed
        // paragraph raise the react-virtuoso: Zero-sized element, this should not happen
        // if there is no border.
        border: '1px solid transparent',
        // backgroundColor: 'lightblue',
    },
    hebrew: {
        width: '50%',
        float: 'left',
        fontFamily: 'SBL Hebrew',
        fontSize: 19,
        textAlign: 'right',
        direction: 'rtl',
        // border: '1px solid green',

        margin: 0,
        padding: 1,
        paddingRight: 10,
    },
    transliteration: {
        width: '50%',
        float: 'left',
        textAlign: 'left',
        fontSize: 19,
        direction: 'ltr',
        // border: '1px solid yellow',
        margin: 0,
        padding: 1,
        paddingLeft: 10,
    },
    english: {
        width: '100%',
        textAlign: 'center',
        fontSize: 19,
        color: 'red',
        direction: 'ltr',
        // border: '1px solid yellow',
        margin: 0,
        padding: 0,
    },
    spacer: {
        fontSize: 10,
    },
    header: {
        minWidth: '100%',
        minHeight: 500,
        border: '1px solid blue',
        // backgroundColor: 'lightgreen',
    }
}))