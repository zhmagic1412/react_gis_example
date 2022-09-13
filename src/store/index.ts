import { makeAutoObservable } from 'mobx'

class Store {
  num = 0

  constructor() {
    makeAutoObservable(this)
  }

  add = () => {
    this.num ++
  }
}
const store = new Store()
export default store