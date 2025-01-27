import React, {createContext} from 'react';
import {useLocalObservable} from 'mobx-react-lite';
import appStore from "./appState";

export const storeContext = createContext()

const StoreProvider=({children}) => {
    const store = useLocalObservable(appStore);

    return (
        <storeContext.Provider value={store}>
            {children}
        </storeContext.Provider>
    );
};

export default StoreProvider;