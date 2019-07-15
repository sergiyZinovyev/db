import { Component, OnInit, Injectable} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7000';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
  })

  login() {
    if(this.loginForm.valid){ 
      return this.router.navigate(['user/registration']);
      console.log('this.loginForm.value:', this.loginForm.value);
      let post = this.http.post(`${apiUrl}/create`, this.loginForm.value).subscribe(
        data => {
          if(data){
            console.log(data);
            return post.unsubscribe();
          }
        },
        error => console.log(error)
      );
      //post.unsubscribe();
    }
  }
  get(){
    let get = this.http.get(`${apiUrl}/create`).subscribe( body => {
      console.log(body);
    });
    //get.unsubscribe();
  }

  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
