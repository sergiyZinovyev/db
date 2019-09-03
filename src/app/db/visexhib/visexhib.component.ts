import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
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

export class VisexhibComponent implements OnInit {

  i = 20;
  name: string = "Відвідувачі";
  headerColor = 'rgb(45, 128, 253)';
  nameBut: string = "Зареєстровані відвідувачі";

  displayedColumns: string[] = [
    'id',
    'id_exhibition',
    'id_visitor', 
    'registered', 
    'visited', 
    'date_vis', 
    'date_reg'
  ];
  keyData = [];
  dataSource = new MatTableDataSource();
  expandedElement;

  isLoadingResults = true;

  visitorsIds = new FormGroup({
    id_exhibition: new FormControl(this.server.exhib),
    id_visitor: new FormControl('', [Validators.required]),
    registered: new FormControl(''),
    visited: new FormControl('1'),
    date_vis: new FormControl(''),
    date_reg: new FormControl(''),
  });

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
 
  constructor(
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getBd(this.server.exhib);
    this.dataSource.sort = this.sort;
  }

  getBd(nameTable){
    this.isLoadingResults = true;
    this.keyData = []; 
    let get = this.server.getVisExhib(nameTable).subscribe(data =>{
      console.log("data: ", data);
      this.isLoadingResults = false;
      for (var key in data[0]) {
        this.keyData.push(key)
      }
      //console.log("this.keyData1: ", this.keyData);

      for (let i=0; i<this.displayedColumns.length; i++){
        this.keyData.splice(this.checkArrIdVal(this.keyData, this.displayedColumns[i]), 1)
        //console.log("this.keyData2: ", this.keyData);
      }

      //console.log("this.keyData2: ", this.keyData);
      let viewData = [];
      for(let i=0; i>=0; i++){
        if(!data[i]){break};
        viewData.push({
          id: data[i].id,
          id_exhibition: data[i].id_exhibition,
          id_visitor: data[i].id_visitor,
          registered: data[i].registered, 
          visited: data[i].visited, 
          date_vis: this.dateFormat(data[i].date_vis),
          date_reg: this.dateFormat(data[i].date_reg),
        })
        this.i = i+1;
      }
      this.dataSource.data = viewData;
      console.log("viewData: ", viewData);
      get.unsubscribe();
    });
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


  addId(){
    if(this.visitorsIds.valid){
      this.visitorsIds.patchValue({date_vis: new Date});
      console.log(this.visitorsIds.value);
      this.server.post(this.visitorsIds.value, 'createInExhibition_vis').subscribe(data =>{
        console.log("data: ", data);
        this.visitorsIds.patchValue({id_visitor: ''});
        this.getBd(this.server.exhib);
      })
    } 
  }

}
