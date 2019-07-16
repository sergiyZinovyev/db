import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  userData = new Subject();
  userEmail = new Subject();

  constructor(
  ) { }

  getUserData(data){
    this.userData.next(data);
    //console.log(this.userData);
  }

  getUserEmail(email){
    this.userEmail.next(email);
  }

}
