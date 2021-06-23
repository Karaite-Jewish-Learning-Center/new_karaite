import React, {useState, useEffect} from 'react';
import Select from '@material-ui/core/Select';
import {range} from "../utils/utils";


export default function SelectChapter({chapters, chapter, onSelectChange}) {
    return (
        <div>
            <Select
                native
                onChange={onSelectChange}
            >
                {range(chapters).map((_, i) => (
                    <option key={i} value={i + 1} selected={i+1 === chapter}>{i + 1}</option>
                ))}
            </Select>
        </div>
    )
}

