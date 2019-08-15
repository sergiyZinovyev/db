import {Component, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
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

  exhibForm = new FormGroup({});

  constructor(
    private server: ServerService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    //console.log(this.element);
    //зібрати форму з виставками
    this.loginForm = this.fb.group({
      email: [this.element.email, [Validators.email]],
      prizv: [this.element.prizv, [Validators.required]],
      city: [this.element.city, [Validators.required]],
      cellphone: [this.element.cellphone, [Validators.pattern('380[0-9]{9}')]],
      regnum: [this.element.regnum, []],
      potvid: [this.element.potvid, []],
      name: [this.element.name, [Validators.required]],
      postaddreses: [this.element.postaddreses, []],
      pobatkovi: [this.element.pobatcovi, []],
      gender: [this.element.gender, []],
      m_robotu: [this.element.m_robotu, []],
      sferadij: [this.element.sferadij, []],
      posada: [this.element.posada, []],
      type: [this.element.type, []],
      kompeten: [this.element.kompeten, []],
      datawnesenny: [this.element.datawnesenny, []],
      datelastcor: [this.element.datelastcor, []],
      ins_user: [this.element.ins_user, []],
      countryid: [String(this.element.countryid), [Validators.required]],
      regionid: [String(this.element.regionid), [Validators.required]],
      namepovne: [this.element.namepovne, []],
      postindeks: [this.element.postindeks, []],
      address: [this.element.address, []],
      telephon: [this.element.telephon, []],
      rating: [this.element.rating, []],

    })
  }
  
  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
    regnum: ['', []],
    potvid: ['temp', []]

  })

  // editUser(){
  //   let post = this.server.post(this.loginForm.value, "edit").subscribe(data =>{
  //     console.log("data: ", data);
  //     if(data){
  //       this.getData.emit(this.getTableName());
  //       console.log("unsubscribe");
  //       return post.unsubscribe();
  //     }
  //   });
  // }

  // editUser(){
  //   //this.user.setUserData(this.loginForm.value);
  //   //this.isLoadingResults = true;
  //   this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками
  //   //перевіряємо чи змінилася форма
  //   if(this.checkFormChange()){
  //     console.log('дані не змінилися')
  //     return this.router.navigate(['invite']);
  //   }
  //   this.loginForm.patchValue({table: this.spreadsheet}) //змінюємо поле з таблицею в яку вносити дані
  //   //перевіряємо чи були змінені поля email/cellphone та вносимо відповідні зміни у форму
  //   if(this.loginForm.get('email').value != this.myEmail){
  //     console.log(this.loginForm.get('email').value,'--',this.myEmail);
  //     this.loginForm.patchValue({checkEmail: true})
  //   }
  //   else{this.loginForm.patchValue({checkEmail: false})}
  //   if(this.loginForm.get('cellphone').value != this.myCellphone){
  //     this.loginForm.patchValue({checkPhone: true})
  //   }
  //   else{this.loginForm.patchValue({checkPhone: false})}

  //   if(!this.myRequest){return console.log('Err: myRequest is undefined')};
  //   let post = this.server.post(this.loginForm.value, this.myRequest).subscribe(data =>{
  //     console.log('this.loginForm.value: ',this.loginForm.value);
  //     console.log("dataServer: ", data);
      
  //     if(data){
  //       this.isLoadingResults = false;
  //       if(data[0]){
  //         console.log('такий мейл вже існує');
  //         this.worningCheck = 'Такий емейл або мобільний телефон вже використовується! Внесіть будь ласка інший';
  //       }
  //       else{
  //         this.worningCheck = '';
  //         this.router.navigate(['invite']);
  //       }
  //       console.log("unsubscribe");
  //       return post.unsubscribe();
  //     }
  //   });
  // }

  addUser() {
    let post = this.server.post(this.loginForm.value, "createVis").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        this.getData.emit(this.getTableName());
        console.log("unsubscribe")
        return post.unsubscribe();
      }
    });
  }

  getTableName(): string{
    let table: string;
    switch(this.tableName){
      case "База відвідувачів":
        table = 'visitors';
        break;
      case "Заявки на внесення":
        table = 'visitors_create';
        break;
      case "Заявки на зміну":
        table = 'visitors_edit';
        break;
    }
    return table
  }

  delete(){
    let dataDel = {
      tableName: this.getTableName(),
      regnum: this.loginForm.value.regnum 
    }
    let post = this.server.post(dataDel, "delete").subscribe(data =>{
      console.log("data: ", data);
      if(data){
        console.log("unsubscribe");
        this.getData.emit(this.getTableName());
        return post.unsubscribe();
      }
    });
  }

}
