import React from 'react';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import SelectBook from "./SelectBook";
import {HEBREW, ENGLISH} from "../constants";
import Loading from "./Loading";
import SelectChapter from "./SelectChapter";


export default function HeaderSelect({book_en, book_he ,chapters, chapter, onSelectChangeChapter, onSelectChangeBook, isloaded}) {
    const classes = useStyles()
    if (!isloaded) return <Loading/>
    return (
        <div className={classes.textHeader}>
            <Box display="flex" justifyContent="center" m={1} p={1} className={classes.grid}>
                <Box p={1} className={classes.hebrewName}>
                    <SelectBook book={book_he} language={HEBREW} onSelectBookChange={onSelectChangeBook}/>
                </Box>
                <Box p={1}  className={classes.chapters}>
                    <SelectChapter chapters={chapters} chapter={chapter} onSelectChange={onSelectChangeChapter}/>
                </Box>
                <Box p={1}>
                    <SelectBook book={book_en} language={ENGLISH} onSelectBookChange={onSelectChangeBook}/>
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
        },
        hebrewName:{
            paddingRight:10,
        }
    }
))