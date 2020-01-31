import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  errorMessage:string;
  getSpinner: boolean = false;

  loginForm = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) { }

  ngOnInit() {
  }


  login() {
    if(this.loginForm.valid){
      this.errorMessage = '';
      this.getSpinner = true;
      this.auth.loginUser(this.loginForm.value, (msg:string) =>{
        this.getSpinner = false;
        this.errorMessage = msg;
        console.log('this.auth.errorMessage: ', msg)
      });
    } 
  }

  
}
