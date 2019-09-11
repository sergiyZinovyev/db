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

  //curVisexhib: string = 'visexhibs';

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
    // this.visexhibsForm.get('exhib').valueChanges.subscribe(v => {
    //   //console.log('v: ', v);
    //   if(v == ''){
    //     this.curVisexhib = '1'
    //   }
    //   else {this.curVisexhib = '2'};
    //   //console.log(this.curVisexhib)
    // });
    
  }
 
  getItemMenu(item){
    this.db.setNavDB(item);
  }

  getVisEx(){
    //console.log('item: ',item)
    console.log('this.visexhibsForm.get("exhib").value: ', this.visexhibsForm.get('exhib').value)
    if (this.visexhibsForm.get('exhib').value !== '-1'){
      let exhibName = this.getNameExhib(this.visexhibsForm.get('exhib').value);
      this.server.setExhib(this.visexhibsForm.get('exhib').value, exhibName);
      console.log('переходимо на visexhib');
      this.db.setNavDB('visexhib');
      
      return
    }
    if (this.visexhibsForm.get('exhib').value == '-1'){
      this.db.setNavDB('visexhibs');
      return
    }
    //this.db.setNavDB(item);
  }

  getNameExhib(num){
    let name;
    console.log('this.exhibs: ', this.exhibs);
    this.exhibs.forEach(item =>{
      if(item.numexhib == num){
        // console.log(item.numexhib);
        // console.log(num);
        // console.log(item.nameexhibkor);
        name = item.nameexhibkor
      }
    })
    return name;   
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
