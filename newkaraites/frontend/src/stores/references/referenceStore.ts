import {makeAutoObservable, observable, toJS} from "mobx"
import {fetchData} from '../../components/api/dataFetch';
import {getLevels} from '../../constants/constants';


class ReferenceStore {

    levels_all:string[] = []
    levels_no_tanakh:string[] = []

    constructor() {
        makeAutoObservable(this, {
            levels_all: observable,
            levels_no_tanakh: observable,
        })

        // get levels this is Law, Liturgy, Poetry, etc
        fetchData(getLevels)
            .then(data => {
                this.levels_all = data
                delete data['Tanakh']
                this.levels_no_tanakh = data
            })
            .catch((e) => console.log(e))
    }

    getLevelsAll = (): Array<String> => {
        console.log('getLevelsAll', toJS(this.levels_all))
        return this.levels_all
    }

    getLevelsNoTanakh = (lang:string): Array<String> => {
        return this.levels_no_tanakh
    }
}

const referenceStore = () => {
    return new ReferenceStore()
}

export default referenceStore
