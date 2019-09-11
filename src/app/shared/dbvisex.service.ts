import { Injectable } from '@angular/core';
import { ServerService } from './server.service';
import { UserService } from '../shared/user.service';
import { DbService } from '../shared/db.service';

@Injectable({
  providedIn: 'root'
})
export class DbvisexService {

  // visitorsIds = {
  //   id_exhibition: this.server.frontURL.searchParams.get('idex'),
  //   id_visitor: '',
  //   registered: '1',
  //   visited: '',
  //   date_vis: '',
  //   date_reg: '',
  // }

  constructor(
    private server: ServerService,
    private user: UserService,
    private db: DbService,
  ) { }

  addVisEx(){
    let visitorsIds = {
      id_exhibition: this.server.frontURL.searchParams.get('idex'),
      id_visitor: '',
      registered: '1',
      visited: '',
      date_vis: '',
      date_reg: '',
    };
    let get=this.server.post(this.user.userLogData, "get").subscribe(data =>{ //отримуємо нові дані з бази
      console.log("data: ", data);
      if (data == null){
        console.log("visitor is not exist")
        console.log("unsubscribe")
        return get.unsubscribe();
      }
      if(data[0]){
        console.log("data[0].regnum: ",data[0].regnum)

        let get2 = this.server.getCheckViv(data[0].regnum, this.server.frontURL.searchParams.get('idex')).subscribe(data2 =>{ 
          console.log("checkVis: ", data2);

          if(data2[0]){
            data2[0].registered = data2[0].registered + 1;
            data2[0].reg = 1;
            this.server.post(data2[0], 'editExhibition_vis').subscribe(data3 =>{
              console.log("data: ", data3);
              //this.visitorsIds.id_visitor = '';
              //this.visitorsIds.visited = '1';
            })
            get2.unsubscribe()
            //return cb(data)
          }
          else{
            visitorsIds.id_visitor = data[0].regnum
            this.server.post(visitorsIds, 'createInExhibition_vis').subscribe(data4 =>{ 
              console.log("data: ", data4);
              visitorsIds.id_visitor = '';
            })
            get2.unsubscribe()
            //return cb(data)
          }
          
        })

        console.log("unsubscribe")
        return get.unsubscribe();
      }
    })
  }

  checkVis(id, cb){
    let get = this.server.getCheckViv(id, this.server.exhib.id).subscribe(data =>{ 
      console.log("checkVis: ", data);
        get.unsubscribe();
        return cb(data)     
    })
  }

  checkId(id, cb){
    let get = this.server.getAll('checkIdVisitor',id).subscribe(data =>{ 
      console.log("checkIdVisitor: ", data);
        get.unsubscribe();
        return cb(data)     
    })
  }


}
