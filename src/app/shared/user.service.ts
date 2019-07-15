import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7000';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  create(value) {
    let post = this.http.post(`${apiUrl}/create`, value).subscribe(
      data => {
        if(data){
          console.log(data);
          return post.unsubscribe();
        }
      },
      error => console.log(error)
    );    
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
