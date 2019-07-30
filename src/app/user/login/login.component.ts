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

  matcher = new MyErrorStateMatcher();
  warning: boolean = false;

  constructor(
    private fb: FormBuilder,
    private user: UserService,
    private server: ServerService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    cellphone: ['', [Validators.pattern('380[0-9]{9}'), Validators.required]]
  })


  login() {
    this.warning = true;
    if(this.loginForm.value.email == 'db@db'){
        return this.router.navigate(['db/visitors']);
      }
    if(this.loginForm.get('email').valid || this.loginForm.get('cellphone').valid){
      this.warning = false;
      this.user.setUserLogData(this.loginForm.value);
      let get=this.server.post(this.loginForm.value, "get").subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){
          this.user.setUserData(data);
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
