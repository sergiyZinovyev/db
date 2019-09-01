import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  navDB = {
    dashboard: true,
    visitors: false,
    companies: false,
    plahty: false,
    visexhibs: false
  }
  constructor() { }

  setNavDB(keyArg){
    for (let key in this.navDB) {
      if(key == keyArg){
        this.navDB[key] = true
      }
      else {
        this.navDB[key] = false
      }
    }
  }

}


