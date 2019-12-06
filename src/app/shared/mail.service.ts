import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

export interface IUser {
  id?: number;
  regnum: number; 
  is_send?: string; 
  mail_list_id?: number; 
  date?: string;
  email: string;
  namepovne: string;
}

@Injectable({
  providedIn: 'root'  
})
export class MailService {

  currentSendList: IUser[] = [];

  constructor() { }

  getCurrentSendList(){
    return new Observable(sub => {
      sub.next(this.currentSendList);
    })
  }

  // getCurrentSendList() : Observable<IUser[]> {
  //   return this.currentSendList
  // }

  setCurrentSendList(arrOfObj){
    let newArray = [];
    this.currentSendList = this.currentSendList.concat(arrOfObj);
    for (let index = 0; index < this.currentSendList.length; index++) {
      let element = this.currentSendList[index];
      if(element.email && newArray.filter(item => item.email == element.email).length < 1){
        newArray.push(element);
      }
    }
    this.currentSendList = newArray;
    //console.log('this.currentSendList: ',this.currentSendList);
  }

  clearCurrentSendList(){
    this.currentSendList = [];
  }

  

}
