import { Component, OnInit, OnDestroy} from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';
import { Router } from '@angular/router';



@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit, OnDestroy {

  myExhib: string = 'ТурЕКСПО';

  subUserData;

  submitButtonText: string = '';
  //createText: string = "Зареєструватися та отримати запрошення";
  //editText: string = "Отримати запрошення";
  edit: boolean = false;
  editData;
  region = [{
    regionid: '',
    teretory: ''
  }];
  exhib = [{
    id: '',
    name: '',
    kod: ''
  }];
  checked = false;
  verification = false;
  worningCheck: string;

  isLoadingResults = false;

  myEmail: string = '';
  myCellphone: string = '';

  startLoginForm;

  spreadsheet;
  myRequest;

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    
    this.getRegion('region');
    //this.submitButtonText = this.createText;
    this.subUserData = this.user.userData.subscribe({
      next: (value) => {
        console.log('reg - user.userData: ',value);
        this.getExhib('exhibitions_dict');
        this.loginForm = this.fb.group({
          condition: ['', []],
          table: ['', []],
          checkEmail: [false, []],
          checkPhone: [false, []],
          email: [value[0].email, [Validators.email]],
          prizv: [value[0].prizv, [Validators.required]],
          city: [value[0].city, [Validators.required]],
          cellphone: [value[0].cellphone, [Validators.pattern('380[0-9]{9}')]],
          regnum: [value[0].regnum, []],
          potvid: [value[0].potvid, []],
          name: [value[0].name, [Validators.required]],
          countryid: [String(value[0].countryid), [Validators.required]],
          regionid: [String(value[0].regionid), [Validators.required]],
          m_robotu: [value[0].m_robotu, []],
          pobatkovi: [value[0].pobatkovi, []],
          posada: [value[0].posada, []],
          sferadij: [value[0].sferadij, []],
        })
        this.edit = true;

        this.myEmail = value[0].email;
        this.myCellphone = value[0].cellphone;

        this.startLoginForm = value[0];

        // визначаємо запит до сервера (create/edit)
        switch(value[1].receivedTable) {
          case 'visitors':
            this.spreadsheet = 'visitors_edit';
            this.myRequest = 'createInVisitorsEdit'
            break;
          case 'visitors_create':
            this.spreadsheet = 'visitors_create';
            this.myRequest = 'edit';
            break;
          case 'visitors_edit':
            this.spreadsheet = 'visitors_edit';
            this.myRequest = 'edit';
            break; 
        }

        this.editData = value[0];
        return this.subUserData.unsubscribe();
      }
    })
    this.getExhib('exhibitions_dict');
  }

  loginForm = this.fb.group({
    condition: ['', []],
    table: ['', []],
    checkEmail: [false, []],
    checkPhone: [false, []],
    email: [this.user.userLogData.email, [Validators.email]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: [this.user.userLogData.cellphone, [Validators.pattern('380[0-9]{9}')]],
    regnum: ['', []],
    potvid: ['', []],
    name: ['', [Validators.required]],
    countryid: ['1', [Validators.required]],
    regionid: ['', [Validators.required]],
    m_robotu: ['', []],
    pobatkovi: ['', []],
    posada: ['', []],
    sferadij: ['', []],
  })

  exhibForm = new FormGroup({});

  getRegion(nameTable){
    this.region = [];
    this.server.get(nameTable).subscribe(data =>{
      for(let i=1; i<=25; i++){
        this.region.push({
          regionid: data[i].regionid,
          teretory: data[i].teretory
        })
      }
      console.log(this.region);
    })
  }
  
  getExhib(nameTable){
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
        if(this.getArrFromPotvid().find(currentValue => currentValue == data[i].name) || data[i].name == this.myExhib){value = true}
        this.exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
      }
      console.log(this.exhib);
      this.exhibForm.valueChanges.subscribe(v => {
        this.loginForm.patchValue({potvid: this.getStringExhibForm()}) //змінюємо поле з виставками в загальній формі
      });
    })
  }


  addUser() {
    this.user.setUserLogData({
      email: this.loginForm.get('email').value,
      prizv: this.loginForm.get('prizv').value,
      name: this.loginForm.get('name').value,
      pobatkovi: this.loginForm.get('pobatkovi').value,
      regnum: this.loginForm.get('regnum').value
    });
    this.isLoadingResults = true;
    this.loginForm.patchValue({potvid: this.getStringExhibForm()}) //змінюємо поле з виставками
    this.loginForm.patchValue({table: 'visitors_create'}) //змінюємо поле з таблицею в яку вносити дані
   
    let post = this.server.post(this.loginForm.value, "createInVisitorsCreate").subscribe(data =>{
      console.log('this.loginForm.value: ',this.loginForm.value);
      console.log("dataServer: ", data);
      
      if(data){
        this.isLoadingResults = false;
        if(data[0]){
          console.log('такий мейл вже існує');
          this.worningCheck = 'Такий емейл або мобільний телефон вже використовується! Внесіть будьласка інший';
        }
        else{
          this.worningCheck = '';
          this.router.navigate(['invite']);
        }
        console.log("unsubscribe");
        return post.unsubscribe();
      }
    });
  }

  editUser(){
    this.user.setUserData(this.loginForm.value);
    this.isLoadingResults = true;
    //перевіряємо чи змінилася форма
    if(this.checkFormChange()){
      console.log('дані не змінилися')
      return this.router.navigate(['invite']);
    }
    this.loginForm.patchValue({potvid: this.getStringExhibForm()}) //змінюємо поле з виставками
    this.loginForm.patchValue({table: this.spreadsheet}) //змінюємо поле з таблицею в яку вносити дані
    if(this.loginForm.get('email').value != this.myEmail){
      console.log(this.loginForm.get('email').value,'--',this.myEmail);
      this.loginForm.patchValue({checkEmail: true})
    }
    else{this.loginForm.patchValue({checkEmail: false})}
    if(this.loginForm.get('cellphone').value != this.myCellphone){
      this.loginForm.patchValue({checkPhone: true})
    }
    else{this.loginForm.patchValue({checkPhone: false})}
    if(!this.myRequest){return console.log('Err: myRequest is undefined')};
    let post = this.server.post(this.loginForm.value, this.myRequest).subscribe(data =>{
      console.log('this.loginForm.value: ',this.loginForm.value);
      console.log("dataServer: ", data);
      
      if(data){
        this.isLoadingResults = false;
        if(data[0]){
          console.log('такий мейл вже існує');
          this.worningCheck = 'Такий емейл або мобільний телефон вже використовується! Внесіть будь ласка інший';
        }
        else{
          this.worningCheck = '';
          this.router.navigate(['invite']);
        }
        console.log("unsubscribe");
        return post.unsubscribe();
      }
    });
  }

  submit(){
    this.worningCheck = '';
    if(this.loginForm.get('prizv').valid &&
       this.loginForm.get('city').valid &&
       this.loginForm.get('name').valid &&
       this.loginForm.get('countryid').valid &&
       this.loginForm.get('regionid').valid){
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
            console.log('email: ', this.loginForm.get('email').value);
            console.log('cellphone: ', this.loginForm.get('cellphone').value);
            if(this.edit){
              this.editUser();
            }
            else{this.addUser()}
          }

        } 
        else{
          console.log('заповніть хоча б одне поле')
          this.worningCheck = 'Для отримання запрошення потрібно вказати або мобільний телефон або електронну пошту';
        }   
    }
    else{console.log('error!')} 
  }

  invite(){
    this.router.navigate(['invite'])
  }


  getStringExhibForm(){
    //console.log(this.exhibForm.value)
    let exhibStr: string = '';
    for(var key in this.exhibForm.value){
      if(this.exhibForm.value[key]==true){
        exhibStr=exhibStr+key+', ';
      }
      else{
        exhibStr=exhibStr+', ';
      }
    }
    console.log(exhibStr);
    return exhibStr
  }

  getArrFromPotvid(){
    return this.loginForm.get('potvid').value.split(', ')
  }

  checkFormChange(){
    let flag = true
    console.log('this.startLoginForm: ', this.startLoginForm);
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

  ngOnDestroy(){
    console.log('destroy reg');
    this.user.setUserLogData(this.loginForm.value);
    //this.user.setUserData(this.loginForm.value);
    this.subUserData.unsubscribe();
    //this.user.userData.unsubscribe;
  }

}
