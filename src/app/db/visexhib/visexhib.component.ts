import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
 
  constructor(
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getBd('exhibition_vis');
    this.dataSource.sort = this.sort;
  }

  getBd(nameTable){
    this.isLoadingResults = true;
    this.keyData = []; 
    this.server.getVisitors(nameTable).subscribe(data =>{
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
    else {return new Date()};
    return formated_date;
  }

}
