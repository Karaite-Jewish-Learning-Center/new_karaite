import {runInAction, configure, makeAutoObservable} from "mobx";
import {karaitesBookByLevel, LITURGY} from '../constants/constants'

configure({enforceActions: "observed"});

class LiturgyStore {
    isLoading = true
    private bookDataList = {};

    constructor() {
        makeAutoObservable(this)
        //this.GetDataList().then()
    }

    GetDataList = async () => {
        this.isLoading = true
        await fetch(`${karaitesBookByLevel}${LITURGY}/`)
            .then(response => response.json())
            .then(data => {
                runInAction(() => this.setBooksDataList({data: data}))
                this.isLoading = false
            })
    }

    setBooksDataList = ({data}: { data: any }) => {
        this.bookDataList = data;
    }


    getBooksDataList = () => this.bookDataList

    //getIsLoading =() => this.isLoading
}


export default new LiturgyStore()