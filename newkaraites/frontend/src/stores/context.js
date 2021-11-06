import React, {createContext} from 'react';
import {useLocalStore} from 'mobx-react-lite';
import appStore from "./appState";

export const storeContext = createContext()

const StoreProvider=({children}) => {
    const store = useLocalStore(appStore);

    return (
        <storeContext.Provider value={store}>
            {children}
        </storeContext.Provider>
    );
};

export default StoreProvider;