import { Component, OnInit, Injectable} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../shared/user.service';
import { ServerService } from '../../shared/server.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

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
  })

  email = this.loginForm.get('email').value

  login(email) {
    if(this.loginForm.valid){
      this.user.getUserEmail(this.email);
      let get=this.server.getSome(email).subscribe(data =>{
        console.log("data: ", data);
        if(data[0]){
          this.user.getUserData(data);
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
