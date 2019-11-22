import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Subject, from } from 'rxjs';
import {ServerService} from './server.service'

@Injectable({
  providedIn: 'root'
})

export class UserService {

  userData = new Subject();

  referrer: string;
  
  userLogData = {
    email: '',
    cellphone: '',
    regnum: '',
    prizv: '',
    name: '',
    pobatkovi: '',
    file: ''
  };

  constructor(
    private server: ServerService
  ) { }

  setReferrer(siteURL){
    this.referrer = siteURL;
    console.log('referrer: ', this.referrer);
  }

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

  getIdExDect(id, cb){
    let get = this.server.getAll('getAll', id, 'numexhib', 'exhibitions').subscribe(data =>{
      //console.log('getIdExDect data:', data);
      if(data[0]){
        cb(data[0].id_exhib_dict)
        get.unsubscribe();  
      }
      else{
        cb(0);
        get.unsubscribe();
        
      }
      
    })
  }

}
