import {Component, OnInit, ViewChild} from '@angular/core';
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
  headerColor = 'rgb(45, 128, 253)';
  nameBut: string = "Заявки на внесення";

  displayedColumns: string[] = [
    'regnum', 
    'namepovne', 
    'email', 
    'cellphone', 
    'city', 
    'sferadij',
    'posada',
    'm_robotu',
    'type',
    'potvid',
    'datawnesenny'
  ];
  displayedColumns2 = this.module.addText(this.displayedColumns, 'f_'); //рядок таблиці з фільтрами
  keyData = [];
  dataSource = new MatTableDataSource();
  viewData; //дані для таблиць отримані з БД
  filterData: {filterValue: any, fild: string}[] = [] // дані для фільтрації viewData  
  
  expandedElement;

  isLoadingResults = true;

  myTimeOut; // id таймаута для відміни таймаута

  exhibs = new FormControl();

  exhibsList: string[] = ['ЕлітЕкспо', 'БудЕКСПО', 'ГалМед', 'Деревообробка', 'ТурЕКСПО', 'Дентал'];
  
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private server: ServerService,
    private module: ModulesService,
    private router: Router,
  ) { }

  ngOnInit() {
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
          countryid: data[i].countryid,
          postindeks: data[i].postindeks,
          regionid: data[i].regionid,
          address: data[i].address,
          telephon: data[i].telephon,
          rating: data[i].rating
        })
        this.i = i+1;
      }
      this.dataSource.data = this.viewData;
      console.log("viewData: ", this.viewData);
    });
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
    this.getBd('visitors_edit');
    this.name = 'Заявки на зміну';
    this.getHeaderColor()
  }

  butGetCreateTable(){
    this.getBd('visitors_create');
    this.name = 'Заявки на внесення';
    this.getHeaderColor()
  }

  butGetBd(){
    this.getBd('visitors');
    this.name = 'База відвідувачів';
    this.getHeaderColor()
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

  

}



