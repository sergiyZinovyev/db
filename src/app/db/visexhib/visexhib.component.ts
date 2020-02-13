import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
import { DbService} from '../../shared/db.service';
import { DbvisexService} from '../../shared/dbvisex.service';
import { ModulesService } from '../../shared/modules.service';
import { VisexhibService } from '../visexhib/visexhib.service';
import { IVisitorExhib } from '../visexhib/visexhibinterface';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visexhib',
  templateUrl: './visexhib.component.html',
  styleUrls: ['./visexhib.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class VisexhibComponent implements OnInit, OnDestroy { 
  
  typeOfReg: string = 'Повна';
  types: string[] = ['Повна', 'Часткова', 'Вільна', 'Без реєстрації'];
  disabled: boolean = false;
  
  filterData: {filterValue: any, fild: string}[] = [] // дані для фільтрації viewData;   
  viewData; //дані для таблиць отримані з БД;

  exhib_id = this.server.exhib.id;
  i=15;
  name: string = "Відвідали";
  headerColor = 'rgb(45, 128, 253)';
  disabledColor = 'rgb(150, 150, 150)';
  nameBut: string = "Зареєстровані відвідувачі";

  arrOfCheckId = [];

  displayedColumns: string[] = [
    'id_visitor', 
    'date_vis', 
    'namepovne',
    'cellphone',
    'email',
    'visited',
    'fake_id',
    'realname',
    "select",
  ]; // назви полів, які будуть виведені на екран

  displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами

  keyData = []; //назви полів які отримані з бази але не виведені на екран
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []); // данні для вибірки
  expandedElement;

  isLoadingResults = true;
  subDataTable: Subscription;
  subTypeOfReg: Subscription;
  closedAllSubOn: boolean = true;

  visitorsIds = new FormGroup({
    id_exhibition: new FormControl(this.server.exhib.id),
    id_visitor: new FormControl('', [Validators.required]),
    registered: new FormControl('0'),
    visited: new FormControl('1'),
    date_vis: new FormControl(undefined),
    date_reg: new FormControl(undefined),
    fake_id: new FormControl('0'),
    //ins_user: new FormControl(this.server.frontURL.searchParams.get('id')),
  });

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
 
  constructor(
    private server: ServerService,
    private db: DbService,
    private dbvisex: DbvisexService,
    private router: Router,
    private module: ModulesService,
    private visexserv: VisexhibService,
  ) { }

  ngOnInit() {
    // якщо на сервісі ще немає підписок на таблиці та тип реєстрації то запускаємо їх
    if (!this.visexserv.sub_visex) this.visexserv.getVisex(this.server.exhib.id);
    if (!this.visexserv.sub_getType) this.visexserv.getTypeOfreg(this.server.exhib.id);

    // якщо на сервісі ще немає підписок на моделі таблиць то запускаємо їх
    if (!this.visexserv.sub_model_visex || this.visexserv.sub_model_visex.closed) this.visexserv.getModel();

    // якщо на сервісі немає підписки на сокети то запускаємо її
    if(!this.visexserv.subSockets || this.visexserv.subSockets.closed) this.visexserv.getSubSockets();

    console.log('this.keyDataXX: ',this.keyData);
    // // отримуємо з бази значення типу реєстрації
    this.subTypeOfReg = this.visexserv.typeOfReg.subscribe(data => this.typeOfReg = data);
    // let getType = this.server.getAll("getAll", this.server.exhib.id, 'numexhib', 'exhibitions').subscribe(data=>{
    //   console.log('typeOfReg: ', data);
    //   this.typeOfReg = data[0].typeOfReg;
    //   getType.unsubscribe();
    // });


    // визначаємо неактивні кнопки в залежності від прав доступу
    this.getDisabled();
    this.dataSource.paginator = this.paginator;
    // отримуємо список зареєстрованих відвідувачів
    //this.getBd(this.server.exhib.id, 1);
    this.getBd();
    this.dataSource.sort = this.sort;
  }

  // керує фільтрацією (filterValue - значення фільтру, fild - поле фільтру)
  // повертає новий this.dataSource.data
  filterController(filterValue, fild){
    console.log('filterController/filterValue: ',filterValue);
    let data = this.viewTable(this.viewData, this.name);
    let filterData = this.module.addFiltrData(this.filterData, filterValue, fild);
    for (let i = 0; i < filterData.length; i++) {
      data = this.module.filter(data, filterData[i].filterValue, filterData[i].fild) 
    }
    this.dataSource.data = data;
  }

  filter(filterData){
    console.log('filterData argument of filter(): ', filterData);
    let data = this.viewTable(this.viewData, this.name);
    for (let i = 0; i < filterData.length; i++) {
      //console.log('i=',i);
      data = this.module.filter(data, filterData[i].filterValue, filterData[i].fild) 
    }
    this.dataSource.data = data;
  }

  getDisabled() {
    if([4, 5].includes(Number(localStorage.getItem('access rights')))) return this.disabled = false;
    else return this.disabled = true;
  }

  getExhibName(){
    return this.server.exhib.name;
  }

  getBd(){
    this.keyData = [];
    //отримуємо з бази дані про зареєстрованих відвідувачів вказаної виставки
    this.subDataTable = this.visexserv.visex.subscribe(subData =>{
      let data = subData.data;
      subData.state == 'pending' ? this.isLoadingResults = true : this.isLoadingResults = false;
      console.log("data: ", data);

      for (var key in data[0]) {
        // перебираємо всі назви ключів першого обєкта, та записуємо в масив, щоб визначити назви колонок 
        this.keyData.push(key);
      }

      for (let i=0; i<this.displayedColumns.length; i++){
        //видаляємо з назв колонок ті які мають бути виведені на екрані
        this.keyData.splice(this.module.checkArrIdVal(this.keyData, this.displayedColumns[i]), 1)
      }

      this.viewData = data; 
      //this.viewData = this.viewData.sort(this.module.compareByField('date_vis'));
      //this.dataSource.data = this.viewData

      this.dataSource.data = this.viewTable(this.viewData, this.name);
      this.filter(this.filterData);
      //console.log("viewData: ", this.viewData);
    });
  }

  refreshDataSourse(){
    this.selection.clear();
    this.arrOfCheckId = [];
    this.visexserv.getVisex(this.server.exhib.id)
  }

  viewTable(data: any[], tableName: string){
    let result
    switch (tableName) {
      case 'Відвідали':
        result = data.filter((element: IVisitorExhib) => element.visited > 0);
        result = result.sort(this.module.compareByField('date_vis'));
        break;

      case 'Зареєструвалися на':
        result = data.filter((element: IVisitorExhib) => element.registered > 0);
        result = result.sort(this.module.compareByField('date_reg'));
        break;  

      case 'Ще не відвідали':
        result = data.filter((element: IVisitorExhib) => element.registered > 0 && element.visited <= 0);
        result = result.sort(this.module.compareByField('date_reg'));
        break;
    
      default:
        break;
    }
    return result;
  }

  dateFormat(date){
    return this.module.dateFormat(date)
  }

  addColumn(item: string) {
    this.displayedColumns.splice(this.displayedColumns.length-1, 0, item);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.splice(this.module.checkArrIdVal(this.keyData, item), 1)
    console.log('this.keyData: ',this.keyData);
  }

  removeColumn(item: string) {
    console.log(this.displayedColumns);
    this.displayedColumns.splice(this.module.checkArrIdVal(this.displayedColumns, item), 1);
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_');
    this.keyData.push(item);
    console.log(this.displayedColumns);
  }

  butGetReg(){
    this.selection.clear();
    this.arrOfCheckId = [];
    this.displayedColumns = [
      'id_visitor', 
      'date_reg',
      'namepovne',
      'cellphone',
      'email',
      'referrer',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'new_visitor',  
    ];
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами 
    //this.getBd(this.server.exhib.id, 2);
    //this.getBd();
    this.name = 'Зареєструвалися на';
    this.dataSource.data = this.viewTable(this.viewData, this.name);
    this.getHeaderColor()
  }

  butGetCreateTable(){
    this.selection.clear();
    this.arrOfCheckId = [];
    this.displayedColumns = [
      'id_visitor', 
      'date_reg',
      'namepovne',
      'cellphone',
      'email',
      'referrer',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'new_visitor', 
    ];
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами
    //this.getBd(this.server.exhib.id, 3);
    //this.getBd();
    this.name = 'Ще не відвідали';
    this.dataSource.data = this.viewTable(this.viewData, this.name);
    this.getHeaderColor()
  }

  butGetVis(){
    this.selection.clear();
    this.arrOfCheckId = [];
    this.displayedColumns = [
      'id_visitor', 
      'date_vis', 
      'namepovne',
      'cellphone',
      'email',
      'visited',
      'fake_id',
      'realname',
      "select",
    ];
    this.displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами
    //this.getBd(this.server.exhib.id, 1);
    //this.getBd();
    this.name = 'Відвідали';
    this.dataSource.data = this.viewTable(this.viewData, this.name);
    this.getHeaderColor()
  }

  getHeaderColor() {
    switch (this.name) {
      case 'Відвідали':
        this.headerColor = 'rgb(45, 128, 253)';
        break;
      case 'Зареєструвалися на':
        this.headerColor = 'rgb(0, 179, 164)';
        break;
      case 'Ще не відвідали':
        this.headerColor = 'rgb(0, 102, 116)';
        break;
      default:
        break;
    }
  }

  addVisitor(value, method){
    //додати нового відвідувача
    let post = this.server.post(value, method).subscribe(data =>{ 
      console.log("data: ", data); 
      this.visitorsIds.patchValue({id_visitor: null});
      this.visitorsIds.patchValue({fake_id: null});
      //this.visitorsIds.patchValue({visited: '1'});  
      //this.butGetVis();
      //this.pushRow(value);
      post.unsubscribe();
    })
  }

  addId(){
    if(this.visitorsIds.valid){
      this.selection.clear();
      console.log(this.visitorsIds.get('id_visitor').value);
      console.log(this.visitorsIds.value);
      //this.visitorsIds.patchValue({date_vis: new Date});
      //console.log(this.visitorsIds.value);

      //перевіряємо чи є в таблиці реєстрації відвідувач з таким id  
      this.dbvisex.checkVis(this.visitorsIds.get('id_visitor').value, cb=>{
        if(!cb[0]){ //якщо нема
          // alert('відвідувач ще не реєструвався');
          // перевіряємо id на наявність в базі 
          this.dbvisex.checkId(this.visitorsIds.get('id_visitor').value, cb2=>{
            console.log('cb2: ', cb2);
            if(cb2[0]){ //якщо є то відразу заносимо його з бази
              this.addVisitor(this.visitorsIds.value, 'createInExhibition_vis');
              // this.server.post(this.visitorsIds.value, 'createInExhibition_vis').subscribe(data =>{ 
              //   console.log("data: ", data); 
              //   this.visitorsIds.patchValue({id_visitor: ''});
              //   this.butGetVis();
              //   //this.getBd(this.server.exhib.id);
              // })
            }
            else{ //якщо нема
              //перевіряємо тип реєстрації
              if(this.typeOfReg == 'Вільна'){
                let result = confirm('Відвідувач ще не реєструвався.\n\nБудемо реєструвати?');
                if(result){
                  console.log('реєструємо нового відвідувача з присвоюванням йому додатково fake_id');
                  this.server.setFrontURL(window.location);
                  this.server.frontURL.searchParams.set('idex', String(this.server.exhib.id));
                  this.server.frontURL.searchParams.set('exhibreg', '1');
                  this.server.frontURL.searchParams.set('fakeid', String(this.visitorsIds.get('id_visitor').value));
                  this.closedAllSubOn = false;
                  return this.router.navigate(['user/login']);
                }
                else{
                  console.log('не реєструємо нового відвідувача');
                  this.visitorsIds.patchValue({fake_id: String(this.visitorsIds.get('id_visitor').value)});
                  this.visitorsIds.patchValue({id_visitor: null});
                  return this.addVisitor(this.visitorsIds.value, 'createInExhibition_vis');
                }
              }
              if(this.typeOfReg == 'Без реєстрації'){
                //alert('Без реєстрації');  
                this.visitorsIds.patchValue({fake_id: String(this.visitorsIds.get('id_visitor').value)});
                this.visitorsIds.patchValue({id_visitor: null});
                this.addVisitor(this.visitorsIds.value, 'createInExhibition_vis');
              }
              else{
                // реєструємо нового відвідувача з присвоюванням йому додатково fake_id
                alert('Відвідувач ще не реєструвався.\n\nПотрібно зареєструватися.');
                this.server.setFrontURL(window.location);
                this.server.frontURL.searchParams.set('idex', String(this.server.exhib.id));
                this.server.frontURL.searchParams.set('exhibreg', '1');
                this.server.frontURL.searchParams.set('fakeid', String(this.visitorsIds.get('id_visitor').value));
                console.log('fakeid: ', String(this.visitorsIds.get('id_visitor').value));
                this.closedAllSubOn = false;
                this.router.navigate(['user/login']);
              }  
            }
          });
        }
        else { //якщо є то редагуємо запис (додаємо відмітку visited та час)
          //this.visitorsIds.patchValue({visited: cb[0].visited + 1}); 
          cb[0].visited = cb[0].visited + 1; //збільшуємо кількість візитів на 1
          cb[0].vis = 1;
          console.log('user already exist');
          //console.log('edit data: ', this.visitorsIds.value);
          this.addVisitor(cb[0], 'editExhibition_vis');
          // this.server.post(cb[0], 'editExhibition_vis').subscribe(data =>{
          //   console.log("data: ", data);
          //   this.visitorsIds.patchValue({id_visitor: ''});
          //   //this.visitorsIds.patchValue({visited: '1'});
          //   //this.getBd(this.server.exhib.id);
          //   this.butGetVis();
          // })
        }
      });
    } 
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
      if(!this.arrOfCheckId.includes(dataSource.id_vis)){
        this.arrOfCheckId.push(dataSource.id_vis);
      }
    }
    else {
      this.arrOfCheckId.splice(this.module.checkArrIdVal(this.arrOfCheckId, dataSource.id_vis), 1);
    }
    console.log(this.arrOfCheckId);
   }

  onCompleteRow(dataSource) {
    dataSource.data.forEach(element => {
      if(!this.arrOfCheckId.includes(element.id_vis)){
        this.arrOfCheckId.push(element.id_vis);
      }
    });
    console.log(this.arrOfCheckId);
  }

  delVis(){
    if(!this.arrOfCheckId[0]){return alert('Ви не обрали жодного елемента для видалення')}
    let isConfirm = confirm("Ви намагаєтеся видалити записи.\nУВАГА! Відновлення буде неможливе!\nБажаєте продовжити?");
    if(isConfirm){
      let dataDel = {
        id_exhibition: this.server.exhib.id,
        id_visitor: this.arrOfCheckId.join(', '), 
      }
      let post = this.server.post(dataDel, "editExhibition_vis_visited_cancel").subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){this.server.accessIsDenied(data[0].rights);}
        // this.selection.clear();
        // this.arrOfCheckId = [];
        this.butGetVis();
        if(data){
          console.log("unsubscribe");
          return post.unsubscribe();
        }
      });
    }
    else return
  }

  setTypeOfReg(value){
    //this.typeOfReg = value;
    let data = {
      typeOfReg: value,
      id_exhibition: this.server.exhib.id
    }
    let post = this.server.post(data, "editExhibition_typeOfReg").subscribe(data =>{
      console.log("data: ", data);
      console.log(this.typeOfReg);
      console.log("unsubscribe");
      return post.unsubscribe();  
    }); 
  }
    

  ngOnDestroy(){
    if(this.closedAllSubOn){
      console.log('@@@@@@@@@@@@@@@@@@ closedAllSub @@@@@@@@@@@@@@@@@@');
      this.visexserv.closedAllSub();}
    this.subDataTable.unsubscribe();
    this.subTypeOfReg.unsubscribe();
    console.log('visehib is destroy');
  }
}
