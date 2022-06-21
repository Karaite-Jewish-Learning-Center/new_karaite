import {makeAutoObservable, observable} from "mobx"
import {fetchData} from '../../components/api/dataFetch';
import {getLevels} from '../../constants/constants';


class ReferenceStore {

    levels_en:string[] = []
    levels_he:string[] = []

    constructor() {
        makeAutoObservable(this, {
            levels_en: observable,
            levels_he: observable,
        })

        // get levels this is Law, Liturgy, Poetry, etc
        fetchData(getLevels)
            .then(data => {
                this.levels_en = data.map((level: string[]) => level[0])
                this.levels_he = data.map((level: string[]) => level[1])
            })
            .catch((e) => console.log(e))
    }

    getLevels = (lang:string): Array<String> => {
        if (lang === 'en') {
            return this.levels_en
        }
        return this.levels_he
    }


}

const referenceStore = () => {
    return new ReferenceStore()
}

export default referenceStore
