import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
import { DbService} from '../../shared/db.service';
import { DbvisexService} from '../../shared/dbvisex.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';

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
  types: string[] = ['Повна', 'Часткова', 'Вільна'];
  disabled: boolean = false;
  

  exhib_id = this.server.exhib.id;
  i=10000;
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

  keyData = []; //назви полів які отримані з бази але не виведені на екран
  dataSource = new MatTableDataSource();
  selection = new SelectionModel(true, []);
  expandedElement;

  isLoadingResults = true;

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
  ) { }

  ngOnInit() {
    // отримуємо з бази значення типу реєстрації
    let getType = this.server.getAll("getAll", this.server.exhib.id, 'numexhib', 'exhibitions').subscribe(data=>{
      console.log('typeOfReg: ', data);
      this.typeOfReg = data[0].typeOfReg;
      getType.unsubscribe();
    });
    // визначвємо неактивні кнопки в залежності від прав доступу
    this.getDisabled();
    this.dataSource.paginator = this.paginator;
    // отримуємо список зареєстрованих відвідувачів
    this.getBd(this.server.exhib.id, 1);
    this.dataSource.sort = this.sort;
  }

  getDisabled() {
    if([4, 5].includes(Number(localStorage.getItem('access rights')))) return this.disabled = false;
    else return this.disabled = true;
  }

  // translate(word){
  //   let translate = word;
  //   switch (word) {
  //     case 'realname':
  //       translate = 'Зареєстрував';
  //       break;
  //     case 'id_visitor':
  //       translate = 'ID відвідувача';
  //       break;
  //     case 'date_vis':
  //       translate = 'Дата візиту';
  //       break;
  //     case 'namepovne':
  //       translate = "Ім'я";
  //       break;
  //     case 'cellphone':
  //       translate = 'Моб. телефон';
  //       break;
  //     case 'visited':
  //       translate = 'К-ть візитів';
  //       break;
  //     default:
  //       break;
  //   }
  //   return translate;
  // }

  getExhibName(){
    return this.server.exhib.name;
  }

  getBd(idExhib, cond?){
    this.isLoadingResults = true;
    this.keyData = []; 
    //отримуємо з бази дані про зареєстрованих відвідувачів вказаної виставки
    let get = this.server.getVisExhib(idExhib, cond).subscribe(data =>{
      console.log("data: ", data);
      this.isLoadingResults = false;
      if(data[0].rights){
        // перевіряємо права користувача, видаємо повідомлення, якщо немає прав
        if(this.server.accessIsDenied(data[0].rights)) return get.unsubscribe();
      }
      for (var key in data[0]) {
        // перебираємо всі назви ключів першого обєкта, та записуємо в масив, щоб визначити назви колонок
        this.keyData.push(key)
      }

      for (let i=0; i<this.displayedColumns.length; i++){
        //видаляємо з назв колонок ті які мають бути виведені на екрані
        this.keyData.splice(this.checkArrIdVal(this.keyData, this.displayedColumns[i]), 1)
      }

      let viewData = []; // створюємо новий масив з отриманх даних
      for(let i=0; i>=0; i++){
        if(!data[i]){break};
        viewData.push({
          id: data[i].id,
          id_exhibition: data[i].id_exhibition,
          fake_id: data[i].fake_id,
          id_visitor: data[i].id_visitor,
          registered: data[i].registered, 
          visited: data[i].visited, 
          date_vis: this.dateFormat(data[i].date_vis),
          date_reg: this.dateFormat(data[i].date_reg),
          realname: data[i].realname,

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
          datawnesenny: this.dateFormat(data[i].datawnesenny),
          datelastcor: this.dateFormat(data[i].datelastcor),
          ins_user: data[i].ins_user,
          countryid: data[i].countryid,
          postindeks: data[i].postindeks,
          regionid: data[i].regionid,
          address: data[i].address,
          telephon: data[i].telephon,
          rating: data[i].rating
        })
        this.i = i+1;
      }
      this.dataSource.data = viewData.sort(this.compareNumeric);
      console.log("viewData: ", viewData);
      get.unsubscribe();
    });
  }

  compareNumeric(a, b) {
    if (a.date_vis < b.date_vis) return 1;
    if (a.date_vis == b.date_vis) return 0;
    if (a.date_vis > b.date_vis) return -1;
  }
  

  checkArrIdVal(array, val):number {
    for (let i: number = 0; i < array.length; i++){
      if (array[i] === val){
        return i;
      }
    }
  }

  dateFormat(d){
    if(d){
      var now = new Date(d);
      var curr_date = ('0' + now.getDate()).slice(-2)
      var curr_month = ('0' + (now.getMonth() + 1)).slice(-2);
      var curr_year = now.getFullYear();
      var curr_hour = ('0' + now.getHours()).slice(-2);
      var curr_minute = ('0' + now.getMinutes()).slice(-2);
      var curr_second = ('0' + now.getSeconds()).slice(-2);
      var formated_date = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
    }
    else {return ''};
    return formated_date;
  }

  addColumn(item: string) {
    this.displayedColumns.push(item);
    this.keyData.splice(this.checkArrIdVal(this.keyData, item), 1)
  }

  removeColumn(item: string) {
    console.log(this.displayedColumns);
    this.displayedColumns.splice(this.checkArrIdVal(this.displayedColumns, item), 1)
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
      'registered',  
    ];
    this.getBd(this.server.exhib.id, 2);
    this.name = 'Зареєструвалися на';
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
      'registered', 
    ];
    this.getBd(this.server.exhib.id, 3);
    this.name = 'Ще не відвідали';
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
    this.getBd(this.server.exhib.id, 1);
    this.name = 'Відвідали';
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
      this.visitorsIds.patchValue({id_visitor: ''});
      //this.visitorsIds.patchValue({visited: '1'});
      this.butGetVis();
      post.unsubscribe();
    })
  }

  addId(){
    if(this.visitorsIds.valid){
      this.selection.clear();
      console.log(this.visitorsIds.get('id_visitor').value);
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
                  // реєструємо нового відвідувача з присвоюванням йому додатково fake_id
                  this.server.setFrontURL(window.location);
                  this.server.frontURL.searchParams.set('idex', String(this.server.exhib.id));
                  this.server.frontURL.searchParams.set('exhibreg', '1');
                  this.server.frontURL.searchParams.set('fakeid', String(this.visitorsIds.get('id_visitor').value));
                  this.router.navigate(['user/login']);
                }
                else{
                  this.visitorsIds.patchValue({fake_id: String(this.visitorsIds.get('id_visitor').value)});
                  this.visitorsIds.patchValue({id_visitor: null});
                  this.addVisitor(this.visitorsIds.value, 'createInExhibition_vis');
                }
              }
              else{
                // реєструємо нового відвідувача з присвоюванням йому додатково fake_id
                alert('Відвідувач ще не реєструвався.\n\nПотрібно зареєструватися.');
                this.server.setFrontURL(window.location);
                this.server.frontURL.searchParams.set('idex', String(this.server.exhib.id));
                this.server.frontURL.searchParams.set('exhibreg', '1');
                this.server.frontURL.searchParams.set('fakeid', String(this.visitorsIds.get('id_visitor').value));
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
      if(!this.arrOfCheckId.includes(dataSource.id_visitor)){
        this.arrOfCheckId.push(dataSource.id_visitor);
      }
    }
    else {
      this.arrOfCheckId.splice(this.checkArrIdVal(this.arrOfCheckId, dataSource.id_visitor), 1);
    }
    console.log(this.arrOfCheckId);
   }

  onCompleteRow(dataSource) {
    dataSource.data.forEach(element => {
      if(!this.arrOfCheckId.includes(element.id_visitor)){
        this.arrOfCheckId.push(element.id_visitor);
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
    console.log("function setTypeOfReg() is work");
    this.typeOfReg = value;
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
    

  ngOnDestroy(){}
}
