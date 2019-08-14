import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { Router } from '@angular/router';
import { ServerService } from '../../shared/server.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
  nameBut: string = "Заявки на внесення";

  displayedColumns: string[] = [
    'regnum', 
    'namepovne', 
    'email', 
    'cellphone', 
    'city', 
    'gender',
    'sferadij',
    'posada',
    'm_robotu',
    'type',
    'datawnesenny'
  ];
  keyData = [];
  dataSource = new MatTableDataSource();
  expandedElement;

  isLoadingResults = true;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getBd('visitors');
    this.dataSource.sort = this.sort;
  }

  getBd(nameTable){
    this.isLoadingResults = true;
    this.keyData = [];
    this.server.get(nameTable).subscribe(data =>{
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
          datawnesenny: data[i].datawnesenny,
          datelastcor: data[i].datelastcor,
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

  // butClickBd(){
  //   if(this.name == "База відвідувачів"){
  //     this.getBd('visitors_create');
  //     this.name = 'Заявки на внесення';
  //     this.nameBut = 'База відвідувачів';
  //   }
  //   else{
  //     this.getBd('visitors');
  //     this.name = 'База відвідувачів';
  //     this.nameBut = 'Заявки на внесення';
  //   }
  // }

  butGetEditTable(){
    this.getBd('visitors_edit');
    this.name = 'Заявки на зміну';
  }

  butGetCreateTable(){
    this.getBd('visitors_create');
    this.name = 'Заявки на внесення';
  }

  butGetBd(){
    this.getBd('visitors');
    this.name = 'База відвідувачів';
  }
  //function(){}

  // delete(id){
  //   let table;
  //   if(this.name == "База відвідувачів"){
  //     table = 'visitors'
  //   }
  //   else{
  //     table = 'visitors_create'
  //   }
  //   let dataDel = {
  //     tableName: table,
  //     regnum: id 
  //   }
  //   let post = this.server.post(dataDel, "delete").subscribe(data =>{
  //     console.log("data: ", data);
  //     if(data){
  //       console.log("unsubscribe");
  //       if(this.name == "База відвідувачів"){
  //         this.getBd('visitors');
  //       }
  //       else{
  //         this.getBd('visitors_create');
  //       }
  //       return post.unsubscribe();
  //     }
  //   });
  // }

}



