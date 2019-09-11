import { Injectable } from '@angular/core';
import { ServerService } from './server.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  navDB = {
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
    
  // checkVis(id, cb){
  //   let get = this.server.getCheckViv(id, this.server.exhib.id).subscribe(data =>{ 
  //     console.log("checkVis: ", data);
  //     if(data[0]){
  //       get.unsubscribe()
  //       return cb(data)
  //     }
  //     else{
  //       get.unsubscribe()
  //       return cb(data)
  //     }
      
  //   })
  // }

  // checkVis(id, cb){
  //   let get = this.server.getCheckViv(id, this.server.exhib.id).subscribe(data =>{ 
  //     console.log("checkVis: ", data);
  //       get.unsubscribe();
  //       return cb(data)     
  //   })
  // }

  // checkId(id, cb){
  //   let get = this.server.getAll('checkIdVisitor',id).subscribe(data =>{ 
  //     console.log("checkIdVisitor: ", data);
  //       get.unsubscribe();
  //       return cb(data)     
  //   })
  // }

}


