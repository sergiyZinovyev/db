import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {FormControl} from '@angular/forms';
import { Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../../shared/server.service';
import { ModulesService } from '../../shared/modules.service';
import { MailService } from '../mail/mail.service';
import { DbService } from '../../shared/db.service';
import { VisitorsService } from './visitors.service';

import {IUser, IMessage, IMailingLists} from '../mail/mailInterface';
import { IVisitor } from '../visitors/visitorsinterface';


// export interface BDVisitors {
//   cellphone: string;
//   city: string;
//   email: string;
//   prizv: string;
//   regnum: number;
// }

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class VisitorsComponent implements OnInit, OnDestroy {
  i = 20;
  name: string = "База відвідувачів";
  disabledColor = 'rgb(150, 150, 150)';
  headerColor = 'rgb(45, 128, 253)';
  headerTextColor = 'rgb(0, 255, 255)';
  nameBut: string = "Заявки на внесення";

  myTable: 'visitors'|'visitors_create'|'visitors_edit' = 'visitors'; //назва таблиці в базі  

  disabled: boolean = false;

  displayedColumns: string[] = [
    'regnum', 
    'namepovne', 
    'email', 
    'cellphone', 
    'sferadij',
    'region',
    'potvid',
    'select',
    'sending'
  ];
  displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами 
  keyData = [
    //'regnum',
    'name',
    'prizv',
    //'namepovne',
    'countryid',
    'postindeks',
    'regionid',
    'city',
    'address',
    'postaddreses',
    'telephon',
    'pobatkovi',
    'gender',
    'm_robotu',
    //'sferadij',
    'posada',
    'type',
    'kompeten',
    //'potvid',
    //'email',
    'datawnesenny ',
    'datelastcor',
    'rating',
    'ins_user',
    //'cellphone',
    'userid',
    'realname',
    'reg_countryid',
    'reg_regionid',
    'country',
    //'reg2_countryid',
    //'reg2_regionid',
    //'region',
    'cityid',
    'id_visitor',
    'visited_exhib',
    //'sending'
  ];
  dataSource = new MatTableDataSource();
  viewData; //дані для таблиць отримані з БД 
  
  filterData: {filterValue: any, fild: string}[] = [] // дані для фільтрації viewData  
  filterDataMap = [];
  field = '';
  
  expandedElement;

  isLoadingResults: boolean;
  isAddingItem = false;
  //isAddingItemSendEmail = false;

  myTimeOut; // id таймаута для відміни таймаута 

  exhibs = new FormControl();
  getFileInput: FormControl = new FormControl('');

  exhibsList: string[] = ['ЕлітЕкспо', 'БудЕКСПО', 'ГалМед', 'Деревообробка', 'ТурЕКСПО', 'Дентал', 'ЄвроАГРО', 'Опалення', 'Вікна-двері-дах', 'Опалення на твердому паливі', 'Готельний та рестор. бізнес', 'Дитячий світ', 'Альтернативна енергетика', 'Стоматологічний ярмарок'];

  selection = new SelectionModel(true, []); // данні для вибірки
  arrOfCheckId = [];

  subDataTable: Subscription;
  
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private server: ServerService,
    private visitorsService: VisitorsService,
    private module: ModulesService,
    //private router: Router,
    private mail: MailService,
    private db: DbService,
  ) { }

  ngOnInit() {
    this.visitorsService.setDisplayedColumns(this.displayedColumns); 
    // якщо на сервісі ще немає підписок на таблиці то запускаємо їх
    if (!this.visitorsService.sub_visitors) this.visitorsService.getVisitors('visitors');
    if (!this.visitorsService.sub_visitors_create) this.visitorsService.getVisitors('visitors_create');
    if (!this.visitorsService.sub_visitors_edit) this.visitorsService.getVisitors('visitors_edit');

    // якщо на сервісі ще немає підписок на моделі таблиць то запускаємо їх
    if (!this.visitorsService.sub_model_visitors)this.visitorsService.getModel('visitors');
    if (!this.visitorsService.sub_model_visitors_create)this.visitorsService.getModel('visitors_create');
    if (!this.visitorsService.sub_model_visitors_edit)this.visitorsService.getModel('visitors_edit');

    // якщо на сервісі немає підписки на сокети то запускаємо її
    if(!this.visitorsService.subSockets) this.visitorsService.getSubSockets();

    this.getDisabled();
    this.dataSource.paginator = this.paginator;
    this.getBd('visitors');
    this.dataSource.sort = this.sort;
  }

  getArrOfFilter(){
    setTimeout(() => this.exhibs.value, 10)
  }
                                                                                                                      


  getBd(nameTable: 'visitors'|'visitors_create'|'visitors_edit'){
    
    this.subDataTable = this.visitorsService[nameTable].subscribe(subData =>{
      let data = subData.data;
      subData.state ? this.isLoadingResults = false : this.isLoadingResults = true;
      console.log("data: ", data);
      // for (var key in data[0]) {
      //   // перебираємо всі назви ключів першого обєкта, та записуємо в масив, щоб визначити назви колонок   
      //   this.keyData.push(key)
      // }
      //this.keyData = this.visitorsService.getAllColumns();
      console.log("this.keyData1: ", this.keyData); 

      for (let i=0; i<this.displayedColumns.length; i++){
        //видаляємо з назв колонок ті які мають бути виведені на екрані
        console.log('this.keyData: ', this.keyData);
        console.log('this.displayedColumns[i]: ', this.displayedColumns[i]);
        let checkId = this.module.checkArrIdVal(this.keyData, this.displayedColumns[i])
        console.log('checkId: ', checkId);
        if(!checkId) continue;
        this.keyData.splice(checkId, 1);
      }

      //console.log("this.keyData2: ", this.keyData); 
      this.viewData = data;
      // this.viewData = [];
      // for(let i=0; i>=0; i++){
      //   if(!data[i]){break};
      //   this.viewData.push({
      //     cellphone: data[i].cellphone,
      //     city: data[i].city, 
      //     email: data[i].email, 
      //     prizv: data[i].prizv, 
      //     regnum: data[i].regnum,
      //     potvid: data[i].potvid,
      //     name: data[i].name,
      //     namepovne: data[i].namepovne,
      //     postaddreses: data[i].postaddreses, 
      //     pobatkovi: data[i].pobatkovi,
      //     gender: data[i].gender,
      //     m_robotu: data[i].m_robotu,
      //     sferadij: data[i].sferadij,
      //     posada: data[i].posada,
      //     type: data[i].type,
      //     kompeten: data[i].kompeten, 
      //     datawnesenny: this.module.dateFormat(data[i].datawnesenny),
      //     datelastcor: this.module.dateFormat(data[i].datelastcor),
      //     ins_user: data[i].ins_user,
      //     realname: data[i].realname,
      //     countryid: data[i].countryid,
      //     country: data[i].country,
      //     postindeks: data[i].postindeks,
      //     regionid: data[i].regionid,
      //     region: data[i].region,
      //     address: data[i].address,
      //     telephon: data[i].telephon,
      //     rating: data[i].rating,
      //     visited_exhib: data[i].visited_exhib,
      //   })
      //   this.i = i+1;
      // }
      this.dataSource.data = this.viewData.sort(this.module.compareByField('regnum'));
      this.filter(this.filterData);
      //this.dataSource.data = this.viewData;
      console.log("viewData: ", this.viewData);
    });
  }

  dateFormat(date){
    return this.module.dateFormat(date)
  }

  editDataSource(action){
    this.isLoadingResults = true;
    switch (action[0]) {
      case 'delete':{
          //this.deleteElementDataSource(this.viewData, action[1]); 
        }
        break;

      case 'edit':{
          this.editElementDataSource(this.viewData, action[1]);
        }
        break;

      case 'create':{
          this.createElementDataSource(this.viewData, action[1]);
       }
       break;  
      
      default:
        break;
    }
  }

  // deleteElementDataSource(dataSource, val){
  //   // console.log('dataSource: ', dataSource);
  //   // console.log('val: ', val);
  //   // if(!Array.isArray(val)){
  //   //   //визначаємо номер елемента масива 
  //   //   let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', val);
  //   //   if(id >= 0){
  //   //     dataSource.splice(id, 1);
  //   //   }    
  //   // }
  //   // else{
  //   //   for (let index = 0; index < val.length; index++) {
  //   //     const element = val[index];
  //   //     let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', element);
  //   //     if(id >= 0){
  //   //       dataSource.splice(id, 1);
  //   //     }
  //   //   }
  //   // }
  //   // console.log('dataSource2: ', dataSource);
  //   // this.dataSource.data = this.viewData;
  //   //застосовуємо фільтр, якщо він є 
  //   // this.filter(this.filterData);
  //   // this.isLoadingResults = false;
  // }

  editElementDataSource(dataSource, val){
    //let saveFilterData = this.filterData; //зберігаємо дані фільтру перед видаленням
    //this.clearFilter(); //очищуємо фітьтр
    // console.log('editElementDataSource is work!');
    // console.log('dataSource: ', dataSource);
    // console.log('val: ', val);
    // let id: Number;
    // let get = this.server.getVisitors(this.myTable, val).subscribe(data =>{
    //   console.log("checkIdVisitor: ", data);
    //   if (!Array.isArray(val)){
    //     id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', data[0].regnum);
    //     if(id >= 0){
    //       dataSource.splice(id, 1, data[0]);
    //     } 
    //   }
    //   //якщо обробляється масив...
    //   else{
    //     for(let key in data){
    //       id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', data[key].regnum);
    //       if(id >= 0){
    //         dataSource.splice(id, 1, data[key]);
    //       } 
    //     }
    //   }
    //   this.dataSource.data = this.viewData;
    //   //застосовуємо фільтр, якщо він є
    //   this.filter(this.filterData);
    //   get.unsubscribe();
    //   this.isLoadingResults = false;  
    //})
  }

  createElementDataSource(dataSource, dataObj){
    // // console.log('editElementDataSource is work!');
    // // console.log('dataSource: ', dataSource);
    // console.log('dataObj: ', dataObj);
    // let get2=this.server.post(dataObj, "get3").subscribe(dataGet3 =>{
    //   console.log('data[0].regnum:', dataGet3[0].regnum);
    //   let val = dataGet3[0].regnum;
    //   //let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', val);
    //   let get = this.server.getVisitors(this.myTable, val).subscribe(data =>{
    //     if(data[0]){
    //       console.log("checkIdVisitor: ", data[0]);
    //       dataSource.splice(0, 0, data[0]);
    //       this.dataSource.data = this.viewData;
    //       //застосовуємо фільтр, якщо він є
    //       this.filter(this.filterData);
    //     } 
    //     get.unsubscribe();  
    //   })
    //   get2.unsubscribe();
    //   this.isLoadingResults = false;
    // })
    //this.isLoadingResults = false;
    this.newElement('isAddingItem') //закриваємо елемент
  }

  setIsLoadingResults(result){
    this.isLoadingResults = result;
  }

  newElement(element: string){
    console.log('element: ',element);
    this[element] = !this[element];
  }

  // керує фільтрацією (filterValue - значення фільтру, fild - поле фільтру) 
  // повертає новий this.dataSource.data 
  filterController(filterValue, fild){
    console.log('filterController/filterValue: ',filterValue);
    let data = this.viewData;
    // додаємо дані для фільтрації
    let filterData = this.module.addFiltrData(this.filterData, filterValue, fild);
    this.filterData = filterData;
    this.filterDataMap = this.filterData.map(item => item.fild);
    // проходимо по масиву фільтрації та фільтруємо всі вказані поля
    for (let i = 0; i < filterData.length; i++) {
      data = this.module.filter(data, filterData[i].filterValue, filterData[i].fild) 
    }
    this.dataSource.data = data;
  }

  filter(filterData){
    console.log('filterData argument of filter(): ', filterData);
    let data = this.viewData;
    for (let i = 0; i < filterData.length; i++) {
      //console.log('i=',i);
      data = this.module.filter(data, filterData[i].filterValue, filterData[i].fild) 
    }
    this.dataSource.data = data;
  }

  // очищуємо фільтр
  clearFilter(){
    // обнуляємо дані для фільтрації
    this.filterData = [];
    this.filterDataMap = [];
    // фільтруємо з пустим масивом, щоб повернути все назад
    this.filter(this.filterData);
    // проходимо по всіх інпутах з фільтрами окрім select та potvid
    this.displayedColumns2.forEach(element => {
      if (element != 'f_select' && element != 'f_potvid'){
        // очищуємо значення
        (<HTMLInputElement>document.getElementById(element)).value = '';
      }
    });
    // встановлюємо значення пусто для potvid
    this.exhibs.setValue('');
  }

  addColumn(item: string) {
    this.visitorsService.addColToModel([item], this.myTable);
    this.displayedColumns.push(item);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.splice(this.module.checkArrIdVal(this.keyData, item), 1)
  }

  removeColumn(item: string) {
    this.visitorsService.delDisplayedColumns(item); 
    this.displayedColumns.splice(this.module.checkArrIdVal(this.displayedColumns, item), 1);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.push(item);
  }

  butGetEditTable(){
    this.subDataTable.unsubscribe()
    this.myTable = 'visitors_edit';
    this.clearFilter();
    this.getBd(this.myTable);
    this.name = 'Заявки на зміну';
    this.getHeaderColor()
  }

  butGetCreateTable(){
    this.subDataTable.unsubscribe()
    this.myTable = 'visitors_create';
    this.clearFilter();
    this.getBd(this.myTable);
    this.name = 'Заявки на внесення';
    this.getHeaderColor()
  }

  butGetBd(){
    this.subDataTable.unsubscribe()
    this.myTable = 'visitors';
    this.clearFilter();
    this.getBd(this.myTable);
    this.name = 'База відвідувачів';
    this.getHeaderColor()
  }

  refreshDataSourse(){
    this.selection.clear();
    this.arrOfCheckId = [];
    this.clearFilter();
    this.visitorsService.getVisitors(this.myTable);
    //if(this.myTable == 'visitors')this.isLoadingResults = true;
    //this.getBd(this.myTable);

  }

  getHeaderColor() {
    switch (this.name) {
      case 'База відвідувачів':
        this.headerColor = 'rgb(45, 128, 253)';
        break;
      case 'Заявки на внесення':
        this.headerColor = 'rgb(0, 179, 164)';
        break;
      case 'Заявки на зміну':
        this.headerColor = 'rgb(0, 102, 116)';
        break;
      default:
        break;
    }
  }
  
// встановлює таймаут на розгортання (приймає id елемента)
  setIntrvl(potvid){
    this.myTimeOut=setTimeout(() => potvid.open(),400);
  }
// згортає елемент та відміняє таймаут (приймає id елемента)
  clearIntrvl(potvid){
    potvid.close();
    clearTimeout(this.myTimeOut);
  }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle($event) {
      if ($event.checked) {
        this.onCompleteRow(this.dataSource);
      }
      if(this.isAllSelected()){
        this.selection.clear();
        this.arrOfCheckId = [];
        console.log(this.arrOfCheckId);
      } else  this.dataSource.data.forEach(row => this.selection.select(row));  
    }
  
    /** The label for the checkbox on the passed row */  
    checkboxLabel(row?): string {
      if (!row) {
        return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
  
    selectRow($event, dataSource) {
      if ($event.checked) {
        if(!this.arrOfCheckId.includes(dataSource.regnum)){
          this.arrOfCheckId.push(dataSource.regnum);
        }
      }
      else {
        this.arrOfCheckId.splice(this.module.checkArrIdVal(this.arrOfCheckId, dataSource.regnum), 1);
      }
      console.log(this.arrOfCheckId);
     }
  
    onCompleteRow(dataSource) {
      dataSource.data.forEach(element => {
        if(!this.arrOfCheckId.includes(element.regnum)){
          this.arrOfCheckId.push(element.regnum);
        }
      });
      console.log(this.arrOfCheckId);
    } 


  // отримати поле з масиву обєктів у вигляді списку 
  getListToFile(field, array, regnum, dataSource){
    console.log('array: ', array);
    let myString = '';
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if(this.module.findOdjInArrObj(dataSource, 'regnum', element).sending == 1){
        let f = this.module.findPropValInArrObj(dataSource, regnum, element, field);
        if(f){myString = myString+f+'\n'} 
      }
    }
    return myString;
  }

  // зберегти список/строку у вигляді файла 
  saveStringAsFile(data, filename, type) {
    //this.isLoadingResults = true;
    if(!data){
      this.isLoadingResults = false;
      this.selection.clear();
      this.arrOfCheckId = [];
      return alert('Ви не обрали жодного запису для збереження');
    }
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      var a = document.createElement("a"),
          url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
      }, 0); 
    }
    this.selection.clear();
    this.arrOfCheckId = [];
    //this.isLoadingResults = false;
  }

  //видалити всі обрані записи
  deleteAllCheckId(table, arrOfId){
    if(arrOfId.length == 0){
      this.isLoadingResults = false;
      return alert('Ви не обрали жодного запису для видалення');
    }
    let isConfirm = confirm("Ви намагаєтеся видалити записи.\nУВАГА! Відновлення буде неможливе!\nБажаєте продовжити?");
    if(isConfirm){
      let dataDel = {
        tableName: table,
        regnum: arrOfId.join(', ')
      }
      let post = this.server.post(dataDel, "delete").subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
          if(this.server.accessIsDenied(data[0].rights)) return post.unsubscribe();
        }
        if(data){
          console.log("unsubscribe");
          // тут треба видалити список локально
          //this.deleteElementDataSource(this.viewData, this.arrOfCheckId);
          this.selection.clear();
          this.arrOfCheckId = [];
          return post.unsubscribe();
        }
      });
    }
  }

  //прийняти всі обрані заявки на внесення
  acceptAllCheckedApplicationForCreation(dataSource, arrOfId, severMethod){
    if(!arrOfId){
      this.isLoadingResults = false;
      return alert('Ви не обрали жодного запису для збереження');
    }
    let isConfirm = confirm("Ви намагаєтеся зберегти в базі обрані заявки.\nУВАГА! Повернутися назад буде неможливо!\nБажаєте продовжити?");
    if(isConfirm){
      // формуємо дані для відправки
      let reqBody = {
        table: this.myTable,
        regnum: arrOfId
      }
      this.server.post(reqBody, 'visitors').pipe(
        map((vl:any): IVisitor[] => Array.from(vl))
      ).subscribe(data=>{
        let newObjData = {
          regnum: [], 
          email: [], 
          prizv: [], 
          city: [], 
          cellphone: [], 
          potvid: [], 
          name: [], 
          countryid: [], 
          regionid: [], 
          m_robotu: [], 
          pobatkovi: [], 
          posada: [], 
          sferadij: [], 
          datawnesenny: [], 
          ins_user: [], 
          namepovne: [],
          postindeks: [],
          address: [],
          postaddreses: [],
          telephon: [],
          gender: [],
          type: [],
          kompeten: [],
          datelastcor: [],
          rating: [],
          sending: [],
          password: []
        };
        for (let index = 0; index < arrOfId.length; index++) {
          const element = this.module.findOdjInArrObj(data, 'regnum', arrOfId[index]);
          for (let key in newObjData){
            newObjData[key].push(element[key]);
          }
        }
        
        let dataAccept = newObjData;
        console.log('dataAccept: ', dataAccept);
        let post = this.server.post(dataAccept, severMethod).subscribe(data =>{
          console.log("data: ", data);
          if(data[0]){
            // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
            if(this.server.accessIsDenied(data[0].rights)) return post.unsubscribe();
          }
          if(data){
            console.log("unsubscribe");
            //тут треба видалити список локально 
            //this.deleteElementDataSource(this.viewData, this.arrOfCheckId);
            this.selection.clear();
            this.arrOfCheckId = [];
            return post.unsubscribe();
          }
        });
      })
    }
  }

  // визначення активних і неактивних кнопок
  getDisabled() {
    if([4, 5].includes(Number(localStorage.getItem('access rights')))) return this.disabled = false;
    else return this.disabled = true;
  }

  //отримати файл
  getFile(id){
    let control = <HTMLInputElement>document.getElementById(id);
    let files = control.files,
        len = files.length;
 
    for (let i=0; i < len; i++) {
        console.log("Filename: " + files[i].name);
        console.log("Type: " + files[i].type);
        console.log("Size: " + files[i].size + " bytes");
    }
    return files[0];
  }

  //отримати дані з файлу та повернути у вигляді масива   
  getDataFile(file){
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsText(file);
      if (file.type != 'text/plain'){
        console.error("File could not be read!");
        reject(reader.error.code);
      }
      reader.onload = () => {
          var contents = reader.result;
          console.log("Вміст файла: \n" + contents);
          resolve(this.getArrFromString(contents));
      };
      reader.onerror = () => {
          console.error("File could not be read!");
          reject(reader.error.code);
      };
    })
  }

  getArrFromString(str){
    let re = /\s*\n\s*/;
    console.log('array: ', str.split(re).filter(Boolean));
    return str.split(re).filter(Boolean);
  }

  fieldFiltr(val){
    this.field = val;
    //console.log('this.field: ',this.field);
    return
  }

  getDataFromFile(id, field){
    this.getDataFile(this.getFile(id)).then(
      data => {
        console.log('subscribe data: ', data);
        return this.filterController(data, field);
      },
      error => {
        alert("Rejected: " + error); // error - аргумент reject 
      }
    )
  }

  deleteRecordFromSelectedField(field: string){
    if(this.arrOfCheckId.length == 0){
        return alert('Ви не обрали жодного запису');
      }
    let isConfirm = confirm("Ви намагаєтеся видалити з бази обрані записи.\nУВАГА! Повернутися назад буде неможливо!\nБажаєте продовжити?");
    if(isConfirm){
      // формуємо дані для відправки
      let dataAccept = {
        table: this.myTable, 
        field: field, 
        id: 'regnum', 
        ids: this.arrOfCheckId, 
      };
      console.log('selected data: ', dataAccept);
      let post = this.server.post(dataAccept, 'editExhibition_del_rec').subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав 
          if(this.server.accessIsDenied(data[0].rights)) return post.unsubscribe();
        }
        //тут треба оновити локальну базу
        this.selection.clear();
        //this.arrOfCheckId = [];
        //this.refreshDataSourse();
        this.editElementDataSource(this.viewData, this.arrOfCheckId);

      })
    }
  }
 
  addMailList(prop?: 'new'){
    if(this.arrOfCheckId.length == 0){
      return alert('Ви не обрали жодного запису для розсилки');
    }
    this.db.setNavDB('mail');
    //if(this.module.findOdjInArrObj(dataSource, 'regnum', element).sending == 1){} 
    //this.newElement("isAddingItemSendEmail");
    let newList = this.module.filter(this.dataSource.data, this.arrOfCheckId, 'regnum');
    newList =  this.module.filter(newList, 1, 'sending');
    let SendList:IUser[] = newList.map(function(obj:IUser) {
      return {regnum: obj.regnum, email: obj.email, namepovne: obj.namepovne, sending: obj.sending};
    });
    //console.log('newList: ',newList);
    if(prop == 'new') this.mail.setNewMessage();
    this.mail.addToCurrentSendList(SendList);   
  }
 
 
  ngOnDestroy(){
    this.subDataTable.unsubscribe();
  }
}



