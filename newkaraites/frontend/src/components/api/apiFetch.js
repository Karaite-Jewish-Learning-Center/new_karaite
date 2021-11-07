import React from "react";
import {searchResultsUrl} from "../../constants/constants";

export const getSearchResult = async (search) => {
    const response = await fetch(searchResultsUrl + `${search}/`)
    if (response.ok) {
        const data = await response.json()
    } else {
        throw new Error(response.status)
    }
}

