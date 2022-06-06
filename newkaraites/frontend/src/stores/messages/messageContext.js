import React,{createContext} from 'react';
import {useLocalObservable} from 'mobx-react-lite';
import messageStore from './messageStore';

export const messageContext = createContext();

const MessageProvider = ({children}) => {
    const data = useLocalObservable(messageStore);
    return (
        <messageContext.Provider value={data}>
            {children}
        </messageContext.Provider>
    )
}

export default MessageProvider;