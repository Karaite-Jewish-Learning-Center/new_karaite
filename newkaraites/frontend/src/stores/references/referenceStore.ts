import {makeAutoObservable, observable, toJS} from "mobx"
import {fetchData} from '../../components/api/dataFetch';
import {getLevels} from '../../constants/constants';
import {getBiblereferencesUrl} from '../../constants/constants';


class ReferenceStore {

    levels_all: string[] = []
    levels_no_tanakh: string[] = []
    references :any[] = []

    constructor() {
        makeAutoObservable(this, {
            levels_all: observable,
            levels_no_tanakh: observable,
            references: observable,
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
        return this.levels_all
    }

    getLevelsNoTanakh = (): Array<String> => {
        return this.levels_no_tanakh
    }



    // getReferences = (): any[] => {
    //     return this.references
    // }
}

const referenceStore = () => {
    return new ReferenceStore()
}

export default referenceStore
