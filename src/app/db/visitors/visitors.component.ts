import {Component, OnInit, ViewChild} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
import { ModulesService } from '../../shared/modules.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {FormControl} from '@angular/forms';

export interface BDVisitors {
  cellphone: string;
  city: string;
  email: string;
  prizv: string;
  regnum: number;
}


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
export class VisitorsComponent implements OnInit {

  i = 20;
  name: string = "База відвідувачів";
  disabledColor = 'rgb(150, 150, 150)';
  headerColor = 'rgb(45, 128, 253)';
  nameBut: string = "Заявки на внесення";

  myTable: string = 'visitors'; //назва таблиці в базі

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
  ];
  displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами
  keyData = [];
  dataSource = new MatTableDataSource();
  viewData; //дані для таблиць отримані з БД 
  
  filterData: {filterValue: any, fild: string}[] = [] // дані для фільтрації viewData  
  
  expandedElement;

  isLoadingResults = true;
  isAddingItem = false;

  myTimeOut; // id таймаута для відміни таймаута 

  exhibs = new FormControl();

  exhibsList: string[] = ['ЕлітЕкспо', 'БудЕКСПО', 'ГалМед', 'Деревообробка', 'ТурЕКСПО', 'Дентал'];

  selection = new SelectionModel(true, []); // данні для вибірки
  arrOfCheckId = [];
  
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private server: ServerService,
    private module: ModulesService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getDisabled();
    this.dataSource.paginator = this.paginator;
    this.getBd('visitors');
    this.dataSource.sort = this.sort;
  }

  getArrOfFilter(){
    setTimeout(() =>{
        //console.log('filtr work: ', this.exhibs.value);
        return this.exhibs.value
      },
      10
    )
    
  }
                                                                                                                      


  getBd(nameTable){
    this.isLoadingResults = true;
    this.keyData = []; 
    this.server.getVisitors(nameTable).subscribe(data =>{
      console.log("data: ", data);
      this.isLoadingResults = false;

      if(!data[0]){
        this.dataSource.data = [];
        return;
      }

      this.server.accessIsDenied(data[0].rights);
      for (var key in data[0]) {
        this.keyData.push(key)
      }
      //console.log("this.keyData1: ", this.keyData); 

      for (let i=0; i<this.displayedColumns.length; i++){
        this.keyData.splice(this.module.checkArrIdVal(this.keyData, this.displayedColumns[i]), 1)
        //console.log("this.keyData2: ", this.keyData);
      }

      //console.log("this.keyData2: ", this.keyData);
      this.viewData = [];
      for(let i=0; i>=0; i++){
        if(!data[i]){break};
        this.viewData.push({
          cellphone: data[i].cellphone,
          city: data[i].city, 
          email: data[i].email, 
          prizv: data[i].prizv, 
          regnum: data[i].regnum,
          potvid: data[i].potvid,
          name: data[i].name,
          namepovne: data[i].namepovne,
          postaddreses: data[i].postaddreses,
          pobatkovi: data[i].pobatkovi,
          gender: data[i].gender,
          m_robotu: data[i].m_robotu,
          sferadij: data[i].sferadij,
          posada: data[i].posada,
          type: data[i].type,
          kompeten: data[i].kompeten, 
          datawnesenny: this.module.dateFormat(data[i].datawnesenny),
          datelastcor: this.module.dateFormat(data[i].datelastcor),
          ins_user: data[i].ins_user,
          realname: data[i].realname,
          countryid: data[i].countryid,
          country: data[i].country,
          postindeks: data[i].postindeks,
          regionid: data[i].regionid,
          region: data[i].region,
          address: data[i].address,
          telephon: data[i].telephon,
          rating: data[i].rating,
          visited_exhib: data[i].visited_exhib,
        })
        this.i = i+1;
      }
      this.dataSource.data = this.viewData.sort(this.compareNumeric);
      //this.dataSource.data = this.viewData;
      console.log("viewData: ", this.viewData);
    });
  }

  editDataSource(action){
    this.isLoadingResults = true;
    switch (action[0]) {
      case 'delete':{
          this.deleteElementDataSource(this.viewData, action[1]);
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

  compareNumeric(a, b) {
    if (a.regnum < b.regnum) return 1;
    if (a.regnum == b.regnum) return 0;
    if (a.regnum > b.regnum) return -1;
  }

  deleteElementDataSource(dataSource, val){
    console.log('dataSource: ', dataSource);
    console.log('val: ', val);
    if(!Array.isArray(val)){
      //визначаємо номер елемента масива 
      let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', val);
      if(id >= 0){
        dataSource.splice(id, 1);
      }    
    }
    else{
      for (let index = 0; index < val.length; index++) {
        const element = val[index];
        let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', element);
        if(id >= 0){
          dataSource.splice(id, 1);
        }
      }
    }
    console.log('dataSource2: ', dataSource);
    this.dataSource.data = this.viewData;
    this.isLoadingResults = false;
  }

  editElementDataSource(dataSource, val){
    console.log('editElementDataSource is work!');
    console.log('dataSource: ', dataSource);
    console.log('val: ', val);
    let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', val);
    let get = this.server.getVisitors(this.myTable, val).subscribe(data =>{ 
      console.log("checkIdVisitor: ", data[0]);
      if(id >= 0){
        dataSource.splice(id, 1, data[0]);
      } 
      this.dataSource.data = this.viewData;
      get.unsubscribe();
      this.isLoadingResults = false;  
    })
  }

  createElementDataSource(dataSource, dataObj){
    // console.log('editElementDataSource is work!');
    // console.log('dataSource: ', dataSource);
    console.log('dataObj: ', dataObj);
    let get2=this.server.post(dataObj, "get3").subscribe(dataGet3 =>{
      console.log('data[0].regnum:', dataGet3[0].regnum);
      let val = dataGet3[0].regnum;
      //let id = this.module.checkArrOfObjIdValField(dataSource, 'regnum', val);
      let get = this.server.getVisitors(this.myTable, val).subscribe(data =>{
        if(data[0]){
          console.log("checkIdVisitor: ", data[0]);
          dataSource.splice(0, 0, data[0]);
          this.dataSource.data = this.viewData;
        } 
        get.unsubscribe();  
      })
      get2.unsubscribe();
      this.isLoadingResults = false;
    })
    this.addNewVisitor() //закриваємо елемент
  }

  setIsLoadingResults(result){
    this.isLoadingResults = result;
  }

  addNewVisitor(){
    this.isAddingItem = !this.isAddingItem;
  }

  // керує фільтрацією (filterValue - значення фільтру, fild - поле фільтру)
  // повертає новий this.dataSource.data 
  filterController(filterValue, fild){
    console.log('filterController/filterValue: ',filterValue);
    let data = this.viewData;
    let filterData = this.module.addFiltrData(this.filterData, filterValue, fild);
    for (let i = 0; i < filterData.length; i++) {
      data = this.module.filter(data, filterData[i].filterValue, filterData[i].fild) 
    }
    this.dataSource.data = data;
  }

  addColumn(item: string) {
    this.displayedColumns.push(item);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.splice(this.module.checkArrIdVal(this.keyData, item), 1)
  }

  removeColumn(item: string) {
    console.log(this.displayedColumns);
    this.displayedColumns.splice(this.module.checkArrIdVal(this.displayedColumns, item), 1);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.push(item);
    console.log(this.displayedColumns);
  }

  butGetEditTable(){
    this.myTable = 'visitors_edit'
    this.getBd(this.myTable);
    this.name = 'Заявки на зміну';
    this.getHeaderColor()
  }

  butGetCreateTable(){
    this.myTable = 'visitors_create'
    this.getBd(this.myTable);
    this.name = 'Заявки на внесення';
    this.getHeaderColor()
  }

  butGetBd(){
    this.myTable = 'visitors'
    this.getBd(this.myTable);
    this.name = 'База відвідувачів';
    this.getHeaderColor()
  }

  refreshDataSourse(){
    this.getBd(this.myTable);
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

  getListToFile(field, array, regnum, dataSource){
    console.log('array: ', array);
    let myString = '';
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      let f = this.module.findPropValInArrObj(dataSource, regnum, element, field);
      if(f){myString = myString+f+'\n'} 
    }
    return myString;
  }

  saveStringAsFile(data, filename, type) {
    //this.isLoadingResults = true;
    if(!data){
      this.isLoadingResults = false;
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
    //this.isLoadingResults = false;
  }

  deleteAllCheckId(table, arrOfId){
    if(!arrOfId){
      this.isLoadingResults = false;
      return alert('Ви не обрали жодного запису для збереження');
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
          this.deleteElementDataSource(this.viewData, this.arrOfCheckId);
          this.selection.clear();
          this.arrOfCheckId = [];
          return post.unsubscribe();
        }
      });
    }
  }

  // визначення активних і неактивних кнопок
  getDisabled() {
    if([4, 5].includes(Number(localStorage.getItem('access rights')))) return this.disabled = false;
    else return this.disabled = true;
  }

}



