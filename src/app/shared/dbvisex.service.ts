import { Injectable } from '@angular/core';
import { ServerService } from '../shared/server.service';
import { UserService } from '../shared/user.service';
import { DbService } from '../shared/db.service';
import { Alert } from 'selenium-webdriver';

@Injectable({
  providedIn: 'root'
})
export class DbvisexService {

  dataVisex;
  timerId;

  constructor(
    private server: ServerService,
    private user: UserService,
    private db: DbService,
  ) { }

  addVisEx(){
    console.log('idex: ', this.server.frontURL.searchParams.get('idex')); 
    let visitorsIds = {
      id_exhibition: this.server.frontURL.searchParams.get('idex'),
      id_visitor: '',
      registered: '1',
      visited: '0', // змінено на '0' 
      date_vis: undefined,
      date_reg: undefined,
      fake_id: '0',
      referrer_url: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      new_visitor: '',
    };
    let get=this.server.post(this.user.userLogData, "get").subscribe(data =>{ //отримуємо нові дані з бази 
      console.log("data: ", data);
      if (data == null){
        console.log("visitor is not exist")
        console.log("unsubscribe")
        return get.unsubscribe();
      }
      if(data[0]){//якщо отримано id з бази відвідувачів...
        console.log("data[0].regnum: ",data[0].regnum)
        //перевіряємо звідки прийшов запит реєстрації (від відвідувача/від реєстратора)
        console.log('exhibreg: ',this.server.frontURL.searchParams.get('exhibreg'));
        visitorsIds.new_visitor = this.identifyNewVisitor(data[0].datawnesenny);

        //якщо від відвідувача...
        if(this.server.frontURL.searchParams.get('exhibreg')!='1'){
          //перевіряємо чи зареєстрований відвідувач
          let get2 = this.server.getCheckViv(data[0].regnum, this.server.frontURL.searchParams.get('idex')).subscribe(data2 =>{ 
            console.log("checkVis: ", data2);
            //якщо зареєстрований то редагуємо
            if(data2[0]){
              alert('ви вже реєструвалися')
              // data2[0].registered = data2[0].registered + 1;
              // data2[0].reg = 1;
              // this.server.post(data2[0], 'editExhibition_vis').subscribe(data3 =>{
              //   console.log("data: ", data3);
              //   //this.visitorsIds.id_visitor = '';
              //   //this.visitorsIds.visited = '1';
              // })
              get2.unsubscribe()
            }
            //інакше вносимо нового
            else{
              //додаємо дані для req.body
              visitorsIds.id_visitor = data[0].regnum;
              visitorsIds.referrer_url = this.user.referrer;
              if(this.server.frontURL.searchParams.get('utm_source')){
                visitorsIds.utm_source = this.server.frontURL.searchParams.get('utm_source');
              }
              if(this.server.frontURL.searchParams.get('utm_medium')){
                visitorsIds.utm_medium = this.server.frontURL.searchParams.get('utm_medium');
              }
              if(this.server.frontURL.searchParams.get('utm_campaign')){
                visitorsIds.utm_campaign = this.server.frontURL.searchParams.get('utm_campaign');
              }
              if(this.server.frontURL.searchParams.get('utm_term')){
                visitorsIds.utm_term = this.server.frontURL.searchParams.get('utm_term');
              }
              if(this.server.frontURL.searchParams.get('utm_content')){
                visitorsIds.utm_content = this.server.frontURL.searchParams.get('utm_content');
              }
              console.log('visitorsIds: ', visitorsIds);
              this.server.post(visitorsIds, 'createInExhibition_vis').subscribe(data4 =>{ 
                console.log("data: ", data4);
                visitorsIds.id_visitor = '';
              })
              get2.unsubscribe()
            }
            
          })
        }

        //якщо не від відвідувача...
        else{

          //перевіряємо чи є такий id в зареєстрованих цієї виставки
          let get3 = this.server.getCheckViv(data[0].regnum, this.server.frontURL.searchParams.get('idex')).subscribe(dataCheckVis =>{
            //якщо зареєстрований то редагуємо
            if (dataCheckVis[0]){
              dataCheckVis[0].visited = String(dataCheckVis[0].visited + 1);
              dataCheckVis[0].vis = 1;
              this.server.post(dataCheckVis[0], 'editExhibition_vis').subscribe(data3 =>{
                console.log("data: ", data3);
                get3.unsubscribe()
              })
            }
            //інакше вносимо нового  
            else{
              visitorsIds.id_visitor = data[0].regnum;
              visitorsIds.registered = '0';
              visitorsIds.visited = '1';
              visitorsIds.fake_id = this.server.frontURL.searchParams.get('fakeid');
              console.log("visitorsIds.fake_id: ",this.server.frontURL.searchParams.get('fakeid'));
              console.log('visitorsIds data: ',visitorsIds);
              let postCreate=this.server.post(visitorsIds, 'createInExhibition_vis').subscribe(data5 =>{ 
                console.log("data: ", data5);
                visitorsIds.id_visitor = '';
                postCreate.unsubscribe();
                get3.unsubscribe();
              })
            } 
          })
          
          get.unsubscribe()
        }
        

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

  // отримання даних про відвідувачів виставки
  getExhibVis(idExhib, cond){
    console.log('this.dataVisex0: ',this.dataVisex);
    this.server.getVisExhib(idExhib, cond).subscribe(data =>{
      this.dataVisex = data;
      console.log('this.dataVisex: ',this.dataVisex);
    })
  }

  // повторювати функцію
  returnGetExhibVis(idExhib, cond, t){
    this.timerId = setInterval(() => this.getExhibVis(idExhib, cond), t)
  }

  // зупинити повтор та очистити дані
  stopFunction(){
    clearTimeout(this.timerId);
    this.dataVisex = [];
    console.log('function - '+this.timerId+' is stop')
  }

  // ідентифікуємо чи відвідувач новий
  identifyNewVisitor(date):string{
    let result: string
    let currentDate = new Date();
    let dateFromDb = new Date(date);
    let differenceDate = (currentDate.getTime() - dateFromDb.getTime())/10000;
    console.log('currentDate: '+currentDate+'; dateFromDb: '+dateFromDb);
    console.log('differenceDate: '+differenceDate+'sec');
    if(differenceDate<60){
      result = 'new';
    }
    else result = '';
    return result
  }

}
