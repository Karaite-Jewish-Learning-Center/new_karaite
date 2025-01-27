import React,{createContext} from 'react';
import {useLocalObservable} from 'mobx-react-lite';
import ttSpeechStore from './ttSpeech';

export const speechContext = createContext();

const SpeechProvider = ({children}) => {
    const data = useLocalObservable(ttSpeechStore);
    return (
        <speechContext.Provider value={data}>
            {children}
        </speechContext.Provider>
    )
}

export default SpeechProvider;