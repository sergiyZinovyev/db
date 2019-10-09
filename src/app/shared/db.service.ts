import { Injectable } from '@angular/core';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  navDB = { //компоненти db (true - відображувати, false - не відображувати)
    dashboard: true,
    visitors: false,
    companies: false,
    plahty: false,
    visexhibs: false,
    visexhib: false,
  }
  constructor(
    private server: ServerService,
  ) { }

  //керує відображенням компонент в db
  setNavDB(keyArg){
    console.log('keyArg: ', keyArg);
    for (let key in this.navDB) {
      if(key == keyArg){
        this.navDB[key] = true
      }
      else {
        this.navDB[key] = false
      }
    }
    console.log('navDB: ', this.navDB);
  }
   
  getAllVisitors(){
    this.server.getVisitors('visitors').subscribe(data =>{})
  }

 

}


