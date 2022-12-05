import React, {createContext} from 'react';
import {useLocalObservable} from 'mobx-react-lite';
import {audioBookStore} from "./audioBook";


export const AudioBookContext = createContext();

const AudioBookProvider = ({children}) => {
    const data = useLocalObservable(audioBookStore);
    return (
        <AudioBookContext.Provider value={data}>
            {children}
        </AudioBookContext.Provider>
    )
}

export default AudioBookProvider;