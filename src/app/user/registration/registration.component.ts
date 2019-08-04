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

  submitButtonText: string = '';
  createText: string = "Зареєструватися та отримати запрошення";
  editText: string = "Редагувати дані та отримати запрошення";
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

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    
    this.getRegion('region');
    this.submitButtonText = this.createText;
    let get = this.user.userData.subscribe({
      next: (value) => {
        console.log(value);
        this.getExhib('exhibitions_dict');
        this.loginForm = this.fb.group({
          condition: ['', []],
          table: ['', []],
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
        this.submitButtonText = this.editText;
        this.editData = value[0];
        return get.unsubscribe();
      }
    })
    this.getExhib('exhibitions_dict');
  }

  loginForm = this.fb.group({
    condition: ['', []],
    table: ['', []],
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
    })
  }


  addUser() {
    this.isLoadingResults = true;
    this.loginForm.patchValue({potvid: this.getStringExhibForm()}) //змінюємо поле з виставками
    this.loginForm.patchValue({table: 'visitors_create'}) //змінюємо поле з таблицею в яку вносити дані
    let post = this.server.post(this.loginForm.value, "create/req").subscribe(data =>{
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
    this.isLoadingResults = true;
    this.loginForm.patchValue({potvid: this.getStringExhibForm()})
    this.loginForm.patchValue({table: 'visitors_edit'}) //змінюємо поле з таблицею в яку вносити дані
    let post = this.server.post(this.loginForm.value, "edit_request").subscribe(data =>{
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

  // verificationExistDataUser(verify) {
  //   this.verification = false;
  //   if(this.loginForm.get(verify).valid){
  //     this.loginForm.patchValue({condition: verify})
  //     let get=this.server.post(this.loginForm.value, "get_spec_cond").subscribe(data =>{
  //       console.log("data: ", data);
  //       if(data[0]){
  //         console.log("data[0]: ", data[0]);
  //         console.log("unsubscribe")
  //         get.unsubscribe();
  //         this.verification = true;
  //         //return true;
  //       }
  //       if(data){
  //         console.log("unsubscribe")
  //         return get.unsubscribe();
  //       }
  //     });
  //     //return console.log('verificationExistDataUser('+verify+'): ',this.verification);
  //   }
  //   else{console.log('invalid: ', verify)}
  // }
	

  // getVerification(){
  //   console.log('this.verification: ',this.verification);
  //   return this.verification
  // }

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
    console.log(this.exhibForm.value)
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
    //console.log('potvad: ', this.loginForm.get('potvid').value);
    //console.log('arr.potvid: ', this.loginForm.get('potvid').value.split(', '));
    return this.loginForm.get('potvid').value.split(', ')
  }

  ngOnDestroy(){
    this.user.setUserLogData(this.loginForm.value);
    this.user.userData.unsubscribe;
  }

}
