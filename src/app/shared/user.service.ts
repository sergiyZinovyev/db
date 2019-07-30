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
    email: '',
    cellphone: ''
  };
  //inviteData;

  constructor(
  ) { }

  setUserData(data){
    this.userData.next(data);
  }

  setUserLogData(data){
    this.userLogData=data;
  }

  // setInviteData(data){
  //   this.inviteData = data
  // }

  getUserEmail(){
    return this.userLogData;
  }

  // getInviteData(){
  //   return this.inviteData;
  // }

}
