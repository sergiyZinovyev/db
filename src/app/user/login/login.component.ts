import { Component, OnInit, Injectable} from '@angular/core';
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

  myCaptha;

  matcher = new MyErrorStateMatcher();
  warning = '';

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
    console.log('window.location: ',window.location);
    this.server.setFrontURL(window.location);
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


  login(capcha) {
    // let capcha = capcha_f;
    // if(!capcha_f){
    //   if(!this.myCaptha){return console.log('reCaptcha is udefined')}
    //   else capcha = this.myCaptha;
    // }

    // this.myCaptha = capcha;
    console.log(`login is work whith token: ${capcha}`);
    this.warning = 'Заповніть хоча б одне поле';
    if(this.loginForm.value.email == 'db@db'){
        return this.router.navigate(['auth']);
      }
    console.log(`Resolved captcha with response: ${capcha}`);
    // if(!capcha){
    //   this.warning = 'reCapcha is undefined'; 
    //   return
    // }
    if(this.loginForm.get('email').valid || this.loginForm.get('cellphone').valid){
      this.warning = '';
      this.user.setUserLogData(this.loginForm.value);
      this.loginForm.patchValue({captcha: capcha})
      let get=this.server.post(this.loginForm.value, "get").subscribe(data =>{
        console.log("data login: ", data);
        //if(data == ''){this.router.navigate(['user/registration']);}  
        if(data[0]){
          this.user.setUserData(data);
          this.router.navigate(['user/registration']);
        }
        if(data){
          console.log("unsubscribe")
          return get.unsubscribe();
        }
      });
      
      return this.router.navigate(['user/registration']);
    }
  }
  

}
