import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../../shared/db.service';
import { ServerService } from '../../shared/server.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  curVisexhib: string = 'visexhibs';

  visexhibsForm = new FormGroup({
    exhib: new FormControl('-1')
  }); 

  exhibs = [{
    nameexhibkor: '',
    numexhib: ''
  }];

  constructor(
    private router: Router,
    private db: DbService,
    private server: ServerService,
  ) { }

  ngOnInit() {
    this.getExhibs('exhibitions');
    this.visexhibsForm.get('exhib').valueChanges.subscribe(v => {
      //console.log('v: ', v);
      if(v == ''){
        this.curVisexhib = '1'
      }
      else {this.curVisexhib = '2'};
      //console.log(this.curVisexhib)
    });
    
  }

  getItemMenu(item){
    //console.log('item: ',item)
    if (item == '2'){
      this.db.setNavDB('visexhib');
      return
    }
    if (item == '1'){
      this.db.setNavDB('visexhibs');
      return
    }
    this.db.setNavDB(item);
  }

  getExhibs(nameTable){
    
    this.exhibs = [];
    this.server.get(nameTable).subscribe(data =>{
      //console.log('getExhibs: ',data);
      for(let i=0; i>-1; i++){
        if(data[i] == undefined){
          this.exhibs.push({
            nameexhibkor: 'всі виставки',
            numexhib: '-1'
          });
          break;
        }
        if(data[i].nameexhibkor !== ""){
          this.exhibs.push({
            nameexhibkor: data[i].nameexhibkor,
            numexhib: data[i].numexhib
          })
        }
      }
      this.exhibs.reverse();
    })
  }


}
