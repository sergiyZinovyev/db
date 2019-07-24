import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
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

  displayedColumns: string[] = ['regnum', 'prizv', 'email', 'cellphone', 'city'];
  dataSource = new MatTableDataSource();
  expandedElement: BDVisitors | null;;
  

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.getBd('visitors');
    // this.server.get('visitors').subscribe(data =>{
    //   console.log("data: ", data);
    //   let viewData = [];
    //   for(let i=0; i>=0; i++){
    //     if(!data[i]){break};
    //     viewData.push({
    //       cellphone: data[i].cellphone, 
    //       city: data[i].city, 
    //       email: data[i].email, 
    //       prizv: data[i].prizv, 
    //       regnum: data[i].regnum})
    //     this.i = i+1;
    //   }
    //   this.dataSource.data = viewData;
    // });
  }

  getBd(nameTable){
    this.server.get(nameTable).subscribe(data =>{
      console.log("data: ", data);
      let viewData = [];
      for(let i=0; i>=0; i++){
        if(!data[i]){break};
        viewData.push({
          cellphone: data[i].cellphone,
          city: data[i].city, 
          email: data[i].email, 
          prizv: data[i].prizv, 
          regnum: data[i].regnum
        })
        this.i = i+1;
      }
      this.dataSource.data = viewData;
    });
  }

  butClickBd(){
    if(this.name == "База відвідувачів"){
      this.getBd('zajavku');
      this.name = 'Заявки на внесення';
      this.nameBut = 'База відвідувачів';
    }
    else{
      this.getBd('visitors');
      this.name = 'База відвідувачів';
      this.nameBut = 'Заявки на внесення';
    }
  }

  function(){}

}



