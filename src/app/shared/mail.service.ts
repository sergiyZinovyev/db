import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerService } from '../shared/server.service';
import {IUser, IMailig, IMessage, IMailingLists} from '../db/mail/mailInterface';
import { ModulesService } from '../shared/modules.service';

@Injectable({
  providedIn: 'root'  
})
export class MailService {

  isAddingItemSendEmail: Subject<boolean> = new Subject();

  currentSendList: IUser[] = [];
  currentMailing: IMailig = {};
  currentMessage: IMessage = {};
  messageID: number | string = 'new';
  mailingID: number | string = 'new';

  constructor(
    private module: ModulesService,
    private server: ServerService
  ) { }

  setIsAddingItemSendEmail(status: boolean): void{
    console.log('status: ', status);
    this.isAddingItemSendEmail.next(status);
  }

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
    this.setIsAddingItemSendEmail(true);
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

//-------------------------------------------------------------------------------------------------
// sockets

  subSockets: Subscription; //підписка на сокети

  //підписитися на сокети
  getSubSockets(){
    this.subSockets = this.server.onSocket().subscribe((data_s: {event: string, data: any}) => {
      console.log('Socket data: ',data_s);
      switch (data_s.event) {

        case 'getMailingPlus': this.handlerGetMailingPlus(data_s.data[0]);
          break;
      
        default: break;
      }
    });
  }

  handlerGetMailingPlus(newData_s: IMailingLists){
    let numberOfArr = this.module.checkArrOfObjIdValField(this.dataMailingList, 'id', newData_s.id);
    //console.log('numberOfArr: ',numberOfArr);
    if(numberOfArr>=0){
      //console.log('така розсилка вже була, заміняємо');
      this.dataMailingList.splice(numberOfArr, 1, newData_s);
      this.mailingList.next(this.dataMailingList);
      return
    }
    else {
      //console.log('розсилки ще не було, додаємо нову');
      this.dataMailingList.unshift(newData_s);
      this.mailingList.next(this.dataMailingList);
      return
    }
  }
  
//-------------------------------------------------------------------------------------------------
// списки розсилок
  
  subMailingList: Subscription; //підписка на початковий список розсилки
  mailingList: BehaviorSubject<IMailingLists[]> = new BehaviorSubject([]); // Observable для списку розсилки
  dataMailingList: IMailingLists[] = []; //останні данні по mailingList

  //підписка на початковий список розсилки
  getSubMailingList(){
    this.subMailingList = this.server.getAll('getMailingList')
      .pipe(map((vl: any, i) => Array.from(vl)))
      .subscribe((data: IMailingLists[]) => {
        this.mailingList.next(data);
        this.subMailingList.unsubscribe()
      });
    //внутрішня підписка на список розсилки
    this.mailingList.subscribe((data_m: IMailingLists[]) => this.dataMailingList=data_m)
  }

//-------------------------------------------------------------------------------------------------

}
