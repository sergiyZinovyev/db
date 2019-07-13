import { Component, OnInit, Injectable} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7000';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'db';
  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required]]
  })

  login() {
    if(this.loginForm.valid){ 
      console.log('this.loginForm.value:', this.loginForm.value);
      let post = this.http.post(`${apiUrl}`, this.loginForm.value).subscribe();
      //post.unsubscribe();
    }
  }
  get(){
    let get = this.http.get(`${apiUrl}`).subscribe( body => {
      console.log('server get: ', body);
    });
    //get.unsubscribe();
  }

  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
