import {Component, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';
import { ServerService } from '../../../shared/server.service';
import {animate, state, style, transition, trigger} from '@angular/animations';


@Component({
  selector: 'app-visitor',
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.css']
})
export class VisitorComponent implements OnInit {

  @Input() element: any;
  @Input() tableName: string;
  @Output() getData = new EventEmitter<any>();

  

  constructor(
    private server: ServerService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    console.log(this.element);
    this.loginForm = this.fb.group({
      email: [this.element.email, [Validators.email, Validators.required]],
      prizv: [this.element.prizv, [Validators.required]],
      city: [this.element.city, [Validators.required]],
      cellphone: [this.element.cellphone, [Validators.required]],
      regnum: [this.element.regnum, []],
    })
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
    regnum: ['', []],
  })

  editUser(){
    let post = this.server.post(this.loginForm.value, "edit").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        let table;
        if(this.tableName == "База відвідувачів"){
          table = 'visitors'
        }
        else{
          table = 'zajavku'
        }
        this.getData.emit(table);
        console.log("unsubscribe");
        return post.unsubscribe();
      }
    });
  }

  addUser() {
    let post = this.server.post(this.loginForm.value, "createVis").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        let table;
        this.delete();
        if(this.tableName == "База відвідувачів"){
          table = 'visitors'
        }
        else{
          table = 'zajavku'
        }
        this.getData.emit(table);
        console.log("unsubscribe")
        return post.unsubscribe();
      }
    });
  }

  submit(){}

  getTableName(): string{
    if(this.tableName == "База відвідувачів"){
      return 'visitors'
    }
    else{
      return 'zajavku'
    }
  }

  updateData(){
    this.getData.emit(this.getTableName());
  }

  delete(){
    let table;
    if(this.tableName == "База відвідувачів"){
      table = 'visitors'
    }
    else{
      table = 'zajavku'
    }
    let dataDel = {
      tableName: table,
      regnum: this.loginForm.value.regnum 
    }
    let post = this.server.post(dataDel, "delete").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        console.log("unsubscribe");
        return post.unsubscribe();
      }
    });
  }

}
