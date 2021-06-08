import React, {Fragment, PureComponent} from "react";
import {useState, useEffect} from 'react';
import {VariableSizeList as List} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import {bookTextUrl} from "../constants";
import axios from 'axios';

const LOADING = 1;
const LOADED = 2;
let itemStatusMap = {};

const isItemLoaded = index => !!itemStatusMap[index];
const loadMoreItems = (startIndex, stopIndex) => {
    for (let index = startIndex; index <= stopIndex; index++) {
        itemStatusMap[index] = LOADING;
    }
    return new Promise(resolve =>
        setTimeout(() => {
            for (let index = startIndex; index <= stopIndex; index++) {
                itemStatusMap[index] = LOADED;
            }
            resolve();
        }, 250)
    );
};


class Row extends PureComponent {
    render() {
        const {index, style} = this.props;
        let label;
        if (itemStatusMap[index] === LOADED) {
            label = `Row ${index}`;
        } else {
            label = "Loading...";
        }
        return (
            <div className="ListItem" style={style}>
               <p>{label}</p>

            </div>
        );
    }
}

export default function App({book}) {
    const [bookData, setBookData] = useState([]);


    const loadMoreText = (start, stop) => {
        debugger
        axios.get(bookTextUrl + `${book}/1/${start+1}/${stop}/`)
            .then((response) => {
                setBookData(response.data);
                debugger
            })
            .catch(error => {

                console.log(`Error on ${bookTextUrl}: ${error.response.data.message}`)
            })

    }

    return (
        <Fragment>

            <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={1000}
                loadMoreItems={loadMoreItems}
            >
                {({onItemsRendered, ref}) => (
                    <List
                        className="List"
                        height={200}
                        itemCount={1000}
                        itemSize={()=>(Math.random()* 30)}
                        onItemsRendered={onItemsRendered}
                        ref={ref}
                        width={300}
                    >
                        {Row}
                    </List>
                )}
            </InfiniteLoader>

        </Fragment>
    );
}
