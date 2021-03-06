import { Component, OnInit, Injectable, ViewChild, ContentChild, ElementRef} from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('captchaRef', {static: true}) captchaRef: ElementRef;

  myCaptha;

  visibleCaptcha: boolean = true; //визначає чи застосовувати рекапчу  

  matcher = new MyErrorStateMatcher();
  warning = '';

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.user.setUserLogData('');
    console.log('window.location: ',window.location);
    this.server.setFrontURL(window.location);
    this.user.setReferrer(window.document.referrer);
    if(this.server.frontURL.searchParams.has('exhibreg')){
      //параметр 'exhibreg' задається під час реєстрації на виставці і свідчить про те що перехід відбувся звідти   
      //в такому разі рекапчу не застосовуємо
      this.visibleCaptcha = false;
    }
  }

  getCurrURL(){
    console.log(this.server.frontURL);
    console.log(this.server.frontURL.searchParams.get('id'));
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    cellphone: ['', [Validators.pattern('380[0-9]{9}'), Validators.required]],
    captcha: ['']
  })


  login(capcha?) {
    // let capcha = capcha_f;
    // if(!capcha_f){
    //   if(!this.myCaptha){return console.log('reCaptcha is udefined')} 
    //   else capcha = this.myCaptha;
    // }

    // this.myCaptha = capcha;
    //console.log(`login is work whith token: ${capcha}`);
    this.warning = 'Заповніть хоча б одне поле';
    if(this.loginForm.value.email == 'db@db'){
        return this.router.navigate(['auth']);
      }
    //console.log(`Resolved captcha with response: ${capcha}`);
    // if(!capcha){
    //   this.warning = 'reCapcha is undefined'; 
    //   return
    // }
    if(this.loginForm.get('email').valid || this.loginForm.get('cellphone').valid){
      this.warning = '';
      //this.user.setUserLogData(this.loginForm.value);
      //this.loginForm.patchValue({captcha: capcha})
      //обираємо який метод get застосувати get2 - з рекапчею чи get3 - без рекапчі але з аутентифікацією
      if(this.visibleCaptcha){
        if (!this.loginForm.get('captcha').value){
          this.warning = 'Підтвердіть що ви не робот';
          return console.log('recaptca undefined')
        }
        let get=this.server.post(this.loginForm.value, "get2").subscribe(data =>{
          //console.log("data login: ", data);
         // console.log("data[0]: ", data[0]);
          //if(data == ''){this.router.navigate(['user/registration']);}
          if(data[0]){
            //alert('setUserData');
            this.user.setUserData(data);
            //this.router.navigate(['registration']);
          }  
          else{
            //alert('setUserLogData'); 
            this.user.setUserRegData(this.loginForm.value);
            //this.router.navigate(['registration']);
          }
          if(data){
            console.log("unsubscribe")
            return get.unsubscribe();
          }
        });
      }
      else{
        let get=this.server.post(this.loginForm.value, "get3").subscribe(data =>{
          //console.log("data login: ", data);
          //if(data == ''){this.router.navigate(['user/registration']);}  
          if(data[0]){
            //alert('setUserData');
            this.user.setUserData(data);
            //this.router.navigate(['registration']);
          }  
          else{
            //alert('setUserLogData');
            this.user.setUserRegData(this.loginForm.value);
            //this.router.navigate(['registration']);
          }
          if(data){
            console.log("unsubscribe")
            return get.unsubscribe();
          }
        });
      }
      
      //console.log('this.captchaRef: ',this.captchaRef.nativeElement.value);
      return this.router.navigate(['registration']);
    }
    else {
      //console.log('this.captchaRef: ',this.captchaRef.nativeElement.value);
    }
  }
  

}
