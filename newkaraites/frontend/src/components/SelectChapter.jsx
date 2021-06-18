import React, {useState} from 'react';
import Box from '@material-ui/core/Box';
import {Typography} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import {makeStyles} from '@material-ui/core/styles';


export default function SelectChapter({book, chapter}) {
    const classes = useStyles()
    const [selectedChapter, setSelectedChapter] = useState(chapter)
    console.log(chapter, selectedChapter)

    const onChange = (e) => {
        setSelectedChapter(e.target.value);
    }

        return (
            <div>
                <Box display="flex" justifyContent="center" m={1} p={1} className={classes.grid}>
                    <Box p={1}>
                        <Typography className={classes.hebrew} variant="h6">{book.book_title_he}</Typography>
                    </Box>
                    <Box p={1}>
                        <Select
                            native
                            value={selectedChapter}
                            onChange={onChange}
                        >
                            {book.verses.map((_, i) => (

                                (i === selectedChapter ? <option value ={i +1}  selected>{i + 1}</option>
                                :  <option value={i + 1}>{i + 1}</option>)
                                ))}
                        </Select>
                    </Box>
                    <Box p={1}>
                        <Typography variant="h6">{book.book_title_en}</Typography>
                    </Box>
                </Box>
            </div>
        )

}


const useStyles = makeStyles((theme) => ({
    hebrew: {
        direction: 'RTL',
    },
    grid: {
        padding: 0,
        margin: 0,
    }
}))