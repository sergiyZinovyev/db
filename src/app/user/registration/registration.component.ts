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
  
  myExhib = ['ТурЕКСПО'];

  subUserData;

  submitButtonText: string = '';
  edit: boolean = false;
  editData;
  region = [{
    regionid: '',
    teretory: ''
  }];
  branch = [
    "Банківські/фінансові послуги",
    "Безпека(забезпечення, засоби)",
    "Будівництво, будматеріали",
    "Видавнича справа, ЗМІ",
    "Готельний бізнес",
    "Громадське харчування",
    "Деревообробна та меблева пром.",
    "Державне та місцеве управління",
    "Зв'язок/телекомунікації",
    "Інформаційні технології",
    "Консультаційні послуги та аудит",
    "Легка промисловість",
    "Лісове господарство",
    "Машинобудування",
    "Медицина (крім стоматології)",
    "Наука/дослідження/проектування",
    "Нерухомість",
    "Освіта",
    "Побутове обслуговування",
    "Індустрія краси",
    "Поліграфія",
    "Реклама",
    "Сільське госпдарство",
    "Стоматологія",
    "Спорт, відпочинок, оздоровлення",
    "Торгівля (продовольчі товари)",
    "Торгівля (промислові товари)",
    "Транспорт",
    "Туризм",
    "Харчова та переробна промисловість",
    "Юридичні послуги",
    "Інше"
  ];
  exhib = [{
    id: '',
    name: '',
    kod: ''
  }];
  //exhib = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), [])[1];
  checked = false;
  verification = false;
  worningCheck: string;

  isLoadingResults = false;

  myEmail: string = '';
  myCellphone: string = '';

  startLoginForm;

  spreadsheet;
  myRequest;

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
    namepovne: ['', []],
    postindeks: ['', []],
    address: ['', []],
    postaddreses: ['', []],
    telephon: ['', []],
    gender: ['', []],
    type: ['', []],
    kompeten: ['', []],
    datawnesenny: ['', []],
    datelastcor: ['', []],
    rating: ['', []],
    ins_user: ['', []],
  })

  exhibForm = new FormGroup({});
  //exhibForm = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), [])[0];
 

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getMyExhib();
    this.getRegion('region');
    //this.submitButtonText = this.createText;
    this.subUserData = this.user.userData.subscribe({
      next: (value) => {
        console.log('reg - user.userData: ',value);
        
        this.getExhib('exhibitions_dict');
        // this.exhibForm = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), this.myExhib)[0];
        // this.exhib = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), this.myExhib)[1];
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
          namepovne: [value[0].namepovne, []],
          postindeks: [value[0].postindeks, []],
          address: [value[0].address, []],
          postaddreses: [value[0].postaddreses, []],
          telephon: [value[0].telephon, []],
          gender: [value[0].gender, []],
          type: [value[0].type, []],
          kompeten: [value[0].kompeten, []],
          datawnesenny: [value[0].datawnesenny, []],
          datelastcor: [value[0].datelastcor, []],
          rating: [value[0].rating, []],
          ins_user: [value[0].ins_user, []],
        })
        //визначаємо: редагуємо дані чи вносимо нові
        this.edit = true;

        this.myEmail = value[0].email;
        this.myCellphone = value[0].cellphone;

        this.startLoginForm = value[0];

        // визначаємо запит до сервера (create/edit)
        switch(value[this.getIndexArrOfRequest(value, 'receivedTable')].receivedTable) {
          case 'visitors':
            this.spreadsheet = 'visitors_edit';
            this.myRequest = 'createInVisitorsEdit'
            break;
          case 'visitors_create':
            this.spreadsheet = 'visitors_create';
            this.myRequest = 'editPro';
            break;
          case 'visitors_edit':
            this.spreadsheet = 'visitors_edit';
            this.myRequest = 'editPro';
            break; 
        }

        this.editData = value[0];
        return this.subUserData.unsubscribe();
      }
    })
    // this.exhibForm = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), this.myExhib)[0]; 
    // this.exhib = this.server.getExhib('exhibitions_dict', this.getArrFromPotvid(), this.myExhib)[1];
    this.getExhib('exhibitions_dict');
  }

  getIndexArrOfRequest(arr: any, myKey: string): number{
    //отримати індекс елеманта масиву, який містить об'єкт з вказаним ключем
    let num: number
    arr.forEach((item: {}, index: number) => {
      for(var key in item){
        if(key == myKey){num = index}
      }
    });
    return num;
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
        if(this.getArrFromPotvid().find(currentValue => currentValue == data[i].name) || this.myExhib.find(currentValue => currentValue == data[i].name)){value = true}
        this.exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
      }
      console.log(this.exhib);
      // this.exhibForm.valueChanges.subscribe(v => {
      //   this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками в загальній формі
      // });
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
    this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками
    this.loginForm.patchValue({table: 'visitors_create'}) //змінюємо поле з таблицею в яку вносити дані
    console.log('this.loginForm.value - after: ',this.loginForm.value);
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
    console.log('data check email&cellphone',this.loginForm.value)
    let get=this.server.post(this.loginForm.value, "get").subscribe(checkData =>{
      //перевіряємо чи є ще інші такі емейли та телефони
      console.log("data check email & cellphone: ", checkData);
      if(checkData[2]){ // якщо є...
        this.isLoadingResults = false;
        get.unsubscribe();
        return this.worningCheck = 'Такий емейл або мобільний телефон вже використовується! Внесіть будь ласка інший';
      }
      else{//якщо нема то продовжуємо...
        this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками
        //перевіряємо чи змінилася форма
        if(this.checkFormChange()){
          console.log('дані не змінилися')
          return this.router.navigate(['invite']);
        }
        this.loginForm.patchValue({table: this.spreadsheet}) //змінюємо поле з таблицею в яку вносити дані
        //перевіряємо чи були змінені поля email/cellphone та вносимо відповідні зміни у форму
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
        get.unsubscribe();
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
        console.log("this.loginForm.get('email').valid: ", this.loginForm.get('email').value," - ",this.loginForm.get('email').valid);
        console.log("this.loginForm.get('cellphone').valid: ", this.loginForm.get('cellphone').value," - ",this.loginForm.get('cellphone').valid);
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


  // getStringExhibForm(){
  //   //перетворення форми виставки(this.exhibForm) в список обраних виставок
  //   let exhibStr: string = '';
  //   for(var key in this.exhibForm.value){
  //     if(this.exhibForm.value[key]==true){
  //       exhibStr=exhibStr+key+', ';
  //     }
  //     else{
  //       exhibStr=exhibStr+', ';
  //     }
  //   }
  //   console.log(exhibStr);
  //   return exhibStr
  // }

  getArrFromPotvid(){
    return this.loginForm.get('potvid').value.split(', ')
    //return this.user.userData[0].potvid.split(', ')
  }

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

  getMyExhib(){
    this.user.getIdExDect(this.server.frontURL.searchParams.get('idex'), data=>{
      //повертаємо з бази id виставки
      switch (data) {
        case 13:
          this.myExhib = ['ТурЕКСПО', 'Готельний та рестор. бізнес', 'Континент розваг'];
          break;
        case 2:
          this.myExhib = ['БудЕКСПО', 'Вікна-двері-дах', 'Опалення', 'Опалення на твердому паливі', 'Альтернативна енергетика'];
          break;
        case 8:
          this.myExhib = ['ГалМЕД'];
          break;
        case 7:
          this.myExhib = ['Дентал-УКРАЇНА'];
          break;
        case 3:
          this.myExhib = ['Деревообробка'];
          break;
        case 17:
          this.myExhib = ['ЕлітЕКСПО'];
          break;
        case 11:
          this.myExhib = ['ЄвроАГРО'];
          break;
        case 22:
          this.myExhib = ['Дитячий світ'];
          break;
        default:
          break;
      }
    });
  }


  ngOnDestroy(){
    console.log('destroy reg');
    this.user.setUserLogData(this.loginForm.value);
    //this.user.setUserData(this.loginForm.value);
    this.subUserData.unsubscribe();
    //this.user.userData.unsubscribe;
  }

}
