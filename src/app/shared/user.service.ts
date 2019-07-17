import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  userData = new Subject();
  userEmail = '';
  inviteData;

  constructor(
  ) { }

  setUserData(data){
    this.userData.next(data);
  }

  setUserEmail(email){
    this.userEmail=email;
  }

  setInviteData(data){
    this.inviteData = data
  }

  getUserEmail(){
    return this.userEmail;
  }

  getInviteData(){
    return this.inviteData;
  }

}
