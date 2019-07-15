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
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    prizv: ['', [Validators.required]],
    city: ['', [Validators.required]],
    cellphone: ['', [Validators.required]],
  })

  login() {
    if(this.loginForm.valid){ 
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
