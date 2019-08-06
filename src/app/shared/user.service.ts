import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  userData = new Subject();
  
  userLogData = {
    email: 'не емейл',
    cellphone: 'не телефон',
    regnum: '',
    prizv: '',
    name: '',
    pobatkovi: ''
  };

  constructor(
  ) { }

  setUserData(data){
    console.log('next userData: ', data);
    this.userData.next(data);
  }

  setUserLogData(data){
    this.userLogData=data;
  }

  getUserEmail(){
    return this.userLogData;
  }


}
