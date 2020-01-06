import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject} from 'rxjs';
import { ServerService } from '../shared/server.service';
import {IUser, IMailig, IMessage} from '../db/mail/mailInterface';

@Injectable({
  providedIn: 'root'  
})
export class MailService {

  currentSendList: IUser[] = [];
  currentMailing: IMailig = {};
  currentMessage: IMessage = {};
  messageID: number | string = 'new';
  mailingID: number | string = 'new';

  constructor(
    private server: ServerService
  ) { }

  // створюємо Observable для списку розсилки
  getCurrentSendList: BehaviorSubject<IUser[]> = new BehaviorSubject(this.currentSendList);

  setCurrentSendList(arrOfObj: IUser[]): void{
    let newArray = [];
    this.currentSendList = this.currentSendList.concat(arrOfObj);
    for (let index = 0; index < this.currentSendList.length; index++) {
      let element = this.currentSendList[index];
      if(element.email && newArray.filter(item => item.email == element.email).length < 1){
        newArray.push(element);
      }
    }
    this.currentSendList = newArray;
    this.getCurrentSendList.next(this.currentSendList);
    //console.log('this.currentSendList: ',this.currentSendList);
  }

  clearCurrentSendList(): void{
    this.currentSendList = [];
    this.getCurrentSendList.next([]);
  }

//-------------------------------------------------------------------------------------------------

  // створюємо Observable для розсилки
  getCurrentMailing: Subject<IMailig> = new Subject();

  setCurrentMailing(id: number): void{
    this.server.getAll('getDataMailing', id).subscribe(data=>{
      console.log('data from getDataMailing: ', data[0]);
      this.setCurrentMessage(data[0].message_id);
      this.setCurrentSendList([{regnum: 125, email: 'test@test', namepovne: 'Pupkin'}])
    })
  }

//-------------------------------------------------------------------------------------------------

  // створюємо Observable для листа
  getMessage: Subject<IMessage> = new Subject();

  setCurrentMessage(id: number): void{
    this.server.getAll('getCurrentMessage', id).subscribe(data=>{
      //console.log('data from getCurrentMessage: ', data[0]);
      this.currentMessage = data[0];
      this.getMessage.next(this.currentMessage);
    })
  }

//-------------------------------------------------------------------------------------------------

  setMessageID(id: number): void{
    this.messageID = id
  }

  

}
