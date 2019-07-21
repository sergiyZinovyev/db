import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

const apiUrl = 'http://localhost:7001';

export interface BDVisitors {
  cellphone: string;
  city: string;
  email: string;
  prizv: string;
  regnum: number;
}

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
  
  get(prop){
    return this.http.get(`${apiUrl}/db/${prop}`)
  }


  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
