import React, {useState, useEffect} from 'react'
import {makeStyles} from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import KaraitesBooks from "./karaitesBooks";
import BiblicalText from "./BiblicalText";
import parseBiblicalReference from "../utils/parseBiblicalReference";
import {
    BOOK_CHAPTERS,
    BOOK_DATA,
    bookChapterUrl,
    getCommentsUrl,
    karaitesBookUrl
} from "../constants/constants";
import CommentsPane from "./CommentPane";
import {makeBookUrl, makeRandomKey} from "../utils/utils";
//import Message from "./Message"

const PresentKaraitesBooks = () => {
    const [panes, setPanes] = useState([])
    const [karaites, setKaraites] = useState()
     const [visibleRange, setVisibleRange] = useState({
        startIndex: 0,
        endIndex: 0,
    })
    // const [message, setMessage] = useState("")

    const classes = useStyles()
    const karaitesBookName = 'Yeriot Shelomo'
    const karaitesBookChapter = '2'


    const getBook = async (book, chapter, verse, highlight) => {
        debugger
        let isOpen = panes.some((pane) => {
            return pane.book === book && pane.chapter === chapter
        })
        if (!isOpen) {
            const response = await fetch(makeBookUrl(bookChapterUrl, book, chapter, false))
            if (response.ok) {
                const data = await response.json()
                debugger
                setPanes([...panes,
                    {
                        book: book,
                        chapter: chapter,
                        verse: verse,
                        highlight: highlight,
                        bookData: data[BOOK_DATA],
                        chapters: data[BOOK_CHAPTERS]
                    }])
            } else {
                alert("HTTP-Error: " + response.status)
            }
        } else {
           // setMessage(`${book} ${chapter}:${verse} is already open.`)
        }
    }

    const refClick = (e) => {
        debugger
        const {book, chapter, verse, highlight} = parseBiblicalReference(e)
        getBook(book, chapter, verse, highlight)
    }

    const onClosePane = (position) => {
        panes.splice(position, 1)
        setPanes([...panes])
    }


    const getComments = async (paneNumber, book, chapter, verse) => {
        let current = panes[paneNumber].comments
        let currentChapter, currentVerse

        if (current !== undefined) {
            currentChapter = current.chapter
            currentVerse = current.verse
        }
        if (currentChapter !== chapter || currentVerse !== verse) {
            const response = await fetch(getCommentsUrl + `${book}/${chapter}/${verse}/`)
            if (response.ok) {
                const data = await response.json()
                panes[paneNumber].comments = {html: data.comments, book: book, chapter: chapter, verse: verse}
                setPanes([...panes])
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
    }

    const onCommentOpen = (paneNumber, book, chapter, verse) => {
        getComments(paneNumber, book, chapter, verse)
    }

    const onCommentClose = (paneNumber) => {
        delete panes[paneNumber].comments
        setPanes([...panes])
    }

    const renderText = (pane, i) => {
        return (
            <Grid item xs>
                <BiblicalText book={pane.book}
                              chapter={pane.chapter}
                              verse={pane.verse}
                              highlight={pane.highlight}
                              fullBook={false}
                              comment={pane.comments}
                              onClosePane={onClosePane.bind(this, i)}
                              onCommentOpen={onCommentOpen}
                              paneNumber={i}
                              bookData={pane.bookData}
                              chapters={pane.chapters}
                />
            </Grid>
        )
    }
    const renderComments = (pane, i) => {
        if (pane.comments !== undefined) {
            const {html, book, chapter, verse} = pane.comments
            return (
                <Grid item xs>
                    <CommentsPane book={book}
                                  chapter={chapter}
                                  verse={verse}
                                  comment={html}
                                  closeCommentTabHandler={onCommentClose.bind(this, i)}
                                  refClick={refClick}/>
                </Grid>
            )
        }
        return null
    }


    useEffect( () => {
        async function fetchData() {
            const response = await fetch(makeBookUrl(karaitesBookUrl, karaitesBookName, karaitesBookChapter, true))
            debugger
            if (response.ok) {
                debugger
                const data = await response.json()
                setKaraites(data[BOOK_CHAPTERS])
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
        fetchData()
    }, [])


    return (

        <div className={classes.container} key={makeRandomKey()}>
            {/*<Message message={message} severity="info" onClose={()=>(setMessage(''))}/>*/}
            <Grid container spacing={0}>
                <Grid item xs className={classes.left}>
                    <KaraitesBooks book={karaitesBookName}
                                   chapter={karaitesBookChapter}
                                   chapters={karaites}
                                   refClick={refClick}
                                   fullBook={true}
                                   visible = {setVisibleRange}
                    />
                </Grid>
                {panes.map((pane, i) => (
                    <>
                        {renderText(pane, i)}
                        {renderComments(pane, i)}
                    </>
                ))}
            </Grid>
        </div>
    )
}

const useStyles = makeStyles((theme) => (
    {
        container: {
            flexGrow: 1,
            position: 'fixed',
            width: '100%',
            height: '85vh',
            top: 60,
        }, left: {
            height: '85vh',
            top: 70,
        }
    }
))

export default PresentKaraitesBooks