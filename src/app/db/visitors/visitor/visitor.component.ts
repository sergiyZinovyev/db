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

  loginForm = this.fb.group({
    email: ['', [Validators.email]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.pattern('380[0-9]{9}')]],
    regnum: ['', []],
    potvid: ['', []],
    name: ['', [Validators.required]],
    postaddreses: ['', []],
    pobatkovi: ['', []],
    gender: ['', []],
    m_robotu: ['', []],
    sferadij: ['', []],
    posada: ['', []],
    type: ['', []],
    kompeten: ['', []],
    datawnesenny: ['', []],
    datelastcor: ['', []],
    ins_user: ['', []],
    countryid: [String(''), [Validators.required]],
    regionid: [String(''), [Validators.required]],
    namepovne: ['', []],
    postindeks: ['', []],
    address: ['', []],
    telephon: ['', []],
    rating: ['', []],

  })
  exhib = [{
    id: '',
    name: '',
    kod: ''
  }];
  exhibForm = new FormGroup({});
  
  region;

  myEmail: string = '';
  myCellphone: string = '';

  worningCheck: string;

  startLoginForm;

  constructor(
    private server: ServerService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.getRegion('region');
    this.loginForm = this.fb.group({
      table: ['visitors', []],
      checkEmail: [false, []],
      checkPhone: [false, []],

      email: [this.element.email, [Validators.email, Validators.required]],
      prizv: [this.element.prizv, [Validators.required]],
      city: [this.element.city, [Validators.required]],
      cellphone: [this.element.cellphone, [Validators.pattern('380[0-9]{9}'), Validators.required]],
      regnum: [this.element.regnum, []],
      potvid: [this.element.potvid, []],
      name: [this.element.name, [Validators.required]],
      postaddreses: [this.element.postaddreses, []],
      pobatkovi: [this.element.pobatkovi, []],
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

    this.startLoginForm = this.element;

    this.myEmail = this.element.email;
    this.myCellphone = this.element.cellphone;
    //збираємо форму з виставками
    this.getExhib('exhibitions_dict');
  }
  
  getRegion(nameTable){
    this.region = [];
    this.server.get(nameTable).subscribe(data =>{
      for(let i=1; i<=25; i++){
        this.region.push({
          regionid: data[i].regionid,
          teretory: data[i].teretory
        })
      }
    })
  }

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

  checkFormChange(){
    let flag = true
    console.log('this.startLoginForm: ', this.startLoginForm);
    console.log('this.loginForm: ', this.loginForm.value);
    for (let key in this.startLoginForm){
      //console.log(key,': ',this.startLoginForm[key])
      if(this.loginForm.get(key)){
        if(this.startLoginForm[key] == this.loginForm.get(key).value){
          console.log(key, ': not changed')
        }
        else{
          flag = false;
          console.log(key, ': changed')
        }
      }
    }
    console.log(flag);
    console.log('-------------------');
    return flag;
  }

  editUser(){
    //this.user.setUserData(this.loginForm.value); 
    //this.isLoadingResults = true;
    this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками 
    //перевіряємо чи змінилася форма
    // if(this.checkFormChange()){
    //   console.log('дані не змінилися')
    //   return //this.router.navigate(['invite']);
    // }
    //this.loginForm.patchValue({table: this.spreadsheet}) //змінюємо поле з таблицею в яку вносити дані

    //перевіряємо чи були змінені поля email/cellphone та вносимо відповідні зміни у форму
    if(this.loginForm.get('email').value != this.myEmail){
      console.log(this.loginForm.get('email').value,'--',this.myEmail);
      this.loginForm.patchValue({checkEmail: true})
    } else{this.loginForm.patchValue({checkEmail: false})}

    if(this.loginForm.get('cellphone').value != this.myCellphone){
      this.loginForm.patchValue({checkPhone: true})
    } else{this.loginForm.patchValue({checkPhone: false})}

    // //if(!this.myRequest){return console.log('Err: myRequest is undefined')};
    // let myRequest: string;
    // if(this.tableName == 'Заявки на внесення'){
    //   //створюємо новий запис в visitors на основі заявки з visitors_create
    //   myRequest = "createInVisitorsEdit"
    // } 
    // if(this.tableName == 'Заявки на зміну' || this.tableName == 'База відвідувачів') {
    //   //редагуємо запис у відповідній таблиці
    //   myRequest = "editPro";
    // }
    // if(this.tableName == 'Відвідали') {
    //   //редагуємо запис у відповідній таблиці
    //   // ... щось робимо ....
    //   //myRequest = "editPro";
    //   myRequest = "editPro2";
    //   //alert('func is complete');
    // }
    let post = this.server.post(this.loginForm.value, "editPro2").subscribe(data =>{
      console.log('this.loginForm.value: ',this.loginForm.value);
      console.log("dataServer: ", data);
      
      if(data){
        if(data[0]){
          if(data[0].found){
            console.log('такий мейл вже існує');
            this.worningCheck = 'Такий емейл або мобільний телефон вже використовується! Внесіть будь ласка інший';
          }
        }
        else{
          this.worningCheck = '';
          //якщо зроблені необхідні зміни то видаляємо запис з таблиці-заявки 
         // if(this.tableName == 'Заявки на зміну' || this.tableName == 'Заявки на внесення') {this.delete()}
          this.getData.emit(this.getTableName())
        }
        console.log("unsubscribe");
        return post.unsubscribe();
      }
    });
  }

  addUser() {
    //ще не використовується і до кінця не реалізований
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
    let isConfirm = confirm("Ви намагаєтеся видалити записи.\nУВАГА! Відновлення буде неможливе!\nБажаєте продовжити?");
    if(isConfirm){
      let dataDel = {
        tableName: this.getTableName(),
        regnum: this.loginForm.value.regnum 
      }
      let post = this.server.post(dataDel, "delete").subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){
          // перевіряємо права користувача, видаємо повідомлення, якщо немає прав
          if(this.server.accessIsDenied(data[0].rights)) return post.unsubscribe();
        }
        if(data){
          console.log("unsubscribe");
          this.getData.emit(this.getTableName());
          return post.unsubscribe();
        }
      });
    }
  }

  getExhib(nameTable){
    //створити форму зі всіх виставок 
    this.exhibForm = new FormGroup({});
    this.server.get(nameTable).subscribe(data =>{
      this.exhib = new Array;
      let value: boolean;
      for(let i=0; i>=0; i++){
        value = false;
        if(!data[i]){break};
        this.exhib.push({
          id: data[i].id,
          name: data[i].name,
          kod: data[i].kod
        })
        if(this.getArrFromPotvid().find(currentValue => currentValue == data[i].name)){value = true}
        this.exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
      }
      console.log(this.exhib); 
    })
  }

  getArrFromPotvid(){
    //створюємо масив виставок
    return this.loginForm.get('potvid').value.split(', ')
  }

  submit(){
    this.worningCheck = '';
    //перевіряємо валідність обов'язкових полей
    if(this.loginForm.get('prizv').valid &&
       this.loginForm.get('name').valid &&
       this.loginForm.get('countryid').valid &&
       this.loginForm.get('regionid').valid){
        console.log("this.loginForm.get('email').valid: ", this.loginForm.get('email').value," - ",this.loginForm.get('email').valid);
        console.log("this.loginForm.get('cellphone').valid: ", this.loginForm.get('cellphone').value," - ",this.loginForm.get('cellphone').valid);
        //перевіряємо чи валідне хоча б одне поле
        if(this.loginForm.get('email').valid || this.loginForm.get('cellphone').valid){
          console.log('email: ', this.loginForm.get('email').value);
          console.log('cellphone: ', this.loginForm.get('cellphone').value);
          if(this.loginForm.get('email').value == null){this.loginForm.patchValue({email: ''})}
          if(this.loginForm.get('cellphone').value == null){this.loginForm.patchValue({cellphone: ''})}

          if((this.loginForm.get('email').invalid && (this.loginForm.get('email').value != '')) ||
             (this.loginForm.get('cellphone').invalid && (this.loginForm.get('cellphone').value != ''))){
            console.log('email: ', this.loginForm.get('email').value);
            console.log('cellphone: ', this.loginForm.get('cellphone').value);
            return console.log('invalid!')
          }
          else{
            //обираємо метод (редагування чи внесення нового)
            this.editUser(); //редагуємо
          }

        } 
        else{
          console.log('заповніть хоча б одне поле')
          this.worningCheck = 'Для внесення в базу потрібно вказати або мобільний телефон або електронну пошту';
        }   
    }
    else{
      console.log('error!')
      this.worningCheck = "Не заповнені всі обов'язкові поля";
    } 
  }

}
