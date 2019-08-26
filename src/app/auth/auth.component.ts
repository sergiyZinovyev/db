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
      this.getSpinner = true;
      this.auth.loginUser(this.loginForm.value);
      setTimeout(()=>{
        this.getSpinner = false;
        this.errorMessage = this.auth.errorMessage;
        console.log('this.auth.errorMessage: ',this.auth.errorMessage)
      }, 300);
      
      
    } 
  }

}
