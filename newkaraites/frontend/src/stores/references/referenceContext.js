import React,{createContext} from 'react';
import {useLocalObservable} from 'mobx-react-lite';
import referenceStore from "./referenceStore";

export const referenceContext = createContext();

const ReferenceProvider = ({children}) => {
    const data = useLocalObservable(referenceStore);
    return (
        <referenceContext.Provider value={data}>
            {children}
        </referenceContext.Provider>
    )
}

export default ReferenceProvider;