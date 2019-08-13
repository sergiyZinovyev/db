import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7001'; //dev host
//const apiUrl = 'http://192.168.5.107:7001'; //prod host


@Injectable({
  providedIn: 'root'
})

export class ServerService {

  frontURL: URL;

  constructor(
    private http: HttpClient
  ) { }

  setFrontURL(url){
    if (this.frontURL){return console.log('url not change - ', this.frontURL)}
    this.frontURL = new URL(url);
    console.log(this.frontURL);
  }

  post(value, prop) {
    return this.http.post(`${apiUrl}/${prop}`, value)    
  }
  
  get(prop){
    return this.http.get(`${apiUrl}/db/${prop}`)
  }

  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
