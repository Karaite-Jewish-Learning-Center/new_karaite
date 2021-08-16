import React, { useEffect, useState } from 'react'
import { container } from '../constants/common-css'
import {
    karaitesBookDetailsUrl
} from '../constants/constants'


const ListKaraitesBooks = () => {
    const [details, setDetails] = useState([])
    const classes = container()


    
    useEffect( () => {
        async function fetchData() {
            const response = await fetch(karaitesBookDetailsUrl)
            if (response.ok) {
                const data = await response.json()
                setDetails(data)
            } else {
                alert("HTTP-Error: " + response.status)
            }
        }
        fetchData()
    }, [])

    return (
        <div className={classes.container}>Book list</div>
    )
}

export default ListKaraitesBooks