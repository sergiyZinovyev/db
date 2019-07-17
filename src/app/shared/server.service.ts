import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7000';

@Injectable({
  providedIn: 'root'
})

export class ServerService {

  getData;

  constructor(
    private http: HttpClient
  ) { }

  post(value, prop) {
    return this.http.post(`${apiUrl}/${prop}`, value)    
  }
  
  get(email?){
    return this.http.get(`${apiUrl}/create`, email)
    // let get = this.http.get(`${apiUrl}/create`).subscribe( data => {
    //   if(data){
    //     //console.log(data);
    //     this.getData = data;
    //     return this.getData;
    //     //get.unsubscribe();
        
    //   }
    //   //console.log(data);
    // });
    // //get.unsubscribe();
    
  }


  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
