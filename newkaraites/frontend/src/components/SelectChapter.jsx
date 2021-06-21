import React, {useState, useEffect} from 'react';
import Box from '@material-ui/core/Box';
import {Typography} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import {makeStyles} from '@material-ui/core/styles';

import Loading from "./Loading";

export default function SelectChapter({book, chapter, onSelectChange, isloaded}) {
    const classes = useStyles()
    const [selectedChapter, setSelectedChapter] = useState(chapter)

    useEffect(() => {
        setSelectedChapter(chapter);
    }, [chapter])
    const title_en = (isloaded ? book.book_title_en : "")
    const title_he = (isloaded ? book.book_title_he : "")
    const verses = (isloaded ? book.verses : [])
    return (
        <div className={classes.textHeader}>
            <Box display="flex" justifyContent="center" m={1} p={1} className={classes.grid}>
                <Box p={1}>
                    <Typography className={classes.hebrew} variant="h6">{title_he}</Typography>
                </Box>
                <Box p={1}>
                    <Select
                        native
                        value={selectedChapter}
                        onChange={onSelectChange}
                    >
                        {verses.map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1}</option>
                        ))}
                    </Select>
                </Box>
                <Box p={1}>
                    <Typography variant="h6">{title_en}</Typography>
                </Box>
                <Box p={1}><Loading isLoaded={isloaded}/></Box>
            </Box>
        </div>
    )
}


const useStyles = makeStyles((theme) => (
    {
        hebrew: {
            direction: 'RTL',
        },
        grid: {
            padding: 0,
            margin: 0,
        }
        ,
        textHeader: {
            minHeight: 50,
            backgroundColor: '#eaeaea',
        }
        ,
    }
))