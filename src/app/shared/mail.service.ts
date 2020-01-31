import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ServerService } from '../shared/server.service';
import {IUser, IMessage, IMailingLists, IMessageInfo} from '../db/mail/mailInterface';
import { ModulesService } from '../shared/modules.service'; 
import { Message } from '../db/mail/message';

@Injectable({
  providedIn: 'root'  
})
export class MailService {

  currentMessage: Message = new Message();

  // creating Observable for the Message
  getMessage: BehaviorSubject<Message> = new BehaviorSubject(this.currentMessage);

  // creating Observable for the Message.subject
  getMessageSubj: BehaviorSubject<Message["subject"]> = new BehaviorSubject(this.currentMessage.subject);


  constructor(
    private fb: FormBuilder,
    private module: ModulesService,
    private server: ServerService
  ) { }

 //------------------------------------------------------------------------------------------------- 

  addToCurrentSendList(arrOfObj: IUser[]): void{
    this.currentMessage.addToSendList(arrOfObj);
    this.getMessage.next(this.currentMessage);
  }

  clearCurrentSendList(): void{
    this.currentMessage.clearSendList();
    this.getMessage.next(this.currentMessage);
  }

  removeFromCurrentSendList(id: number){
    console.log('removeFromCurrentSendList work');
    this.currentMessage.removeFromSendList(id);
    this.getMessage.next(this.currentMessage);
    return this.currentMessage.sendList
  }

//-------------------------------------------------------------------------------------------------

  setCurrentMailing(id: number): void{
    let get = this.server.getAll('getDataMailing', id).subscribe(data=>{
      console.log('data from getDataMailing: ', data[0]);
      let get2 = this.server.getAll('getVisitorsMailingList', data[0].id).pipe(
        map((vl:any): IUser[] => Array.from(vl))
      ).subscribe(data2=>{
        console.log('data2 from getVisitorsMailingList: ', data2);
        this.setCurrentMessage(data[0].message_id, data[0], data2);
        get2.unsubscribe()
      })
      
      //this.setCurrentSendList([{regnum: 125, email: 'test@test', namepovne: 'Pupkin'}]);
      get.unsubscribe()
    })
  }

//-------------------------------------------------------------------------------------------------

  //method create object class of Message
  setCurrentMessage(id: number, meilingData?: IMailingLists, mailingListData?:IUser[]): void{
    let get = this.server.getAll('getCurrentMessage', id).subscribe(data=>{
      console.log('data from getCurrentMessage: ', data[0]);
      this.currentMessage = new Message(data[0], meilingData, mailingListData);
      this.getMessage.next(this.currentMessage);
      get.unsubscribe()
    })
  }

  //створюємо новий лист
  setNewMessage(){
    this.currentMessage = new Message();
    this.getMessage.next(this.currentMessage);
  }

  //вносимо зміни в лист
  setMessage(arr: {key:string, val:any}[]):void{
    this.currentMessage.setKey(...arr);
    this.getMessage.next(this.currentMessage);
  }

//------------------------------------------------------------------------------------------------- 
// sockets

  subSockets: Subscription; //підписка на сокети

  //підписитися на сокети
  getSubSockets(){
    this.subSockets = this.server.socketMessage.subscribe((data_s: {event: string, data: any}) => {
      //console.log('Socket data: ',data_s);
      switch (data_s.event) {

        case 'getMailingPlus': 
          console.log('виконуємо handlerGetMailingPlus');
          console.log('Socket data: ',data_s);
          this.handlerGetMailingPlus(data_s.data[0]);
          break;

        case 'createEditMessage': 
          console.log('виконуємо handlerCreateEditMessage');
          console.log('Socket data: ',data_s);
          this.handlerCreateEditMessage(data_s.data[0]);
          break;

        case 'editVisitorsMailingLists': 
          console.log('виконуємо editVisitorsMailingLists');
          console.log('Socket data: ',data_s);
          let newData: IUser = data_s.data[0];
          console.log('editVisitorsMailingLists: ',newData);
          //this.currentMessage.updateSendList(newData);
          if(this.currentMessage.mailingId == newData.mail_list_id){
            this.currentMessage.updateSendList(newData);
            this.getMessage.next(this.currentMessage);
          }
          break;  
      
        default: break;
      }
    });
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

  //додаємо або заміняємо існуючу розсилку, новою розсилкою (обробник події сокета)
  handlerGetMailingPlus(newData_s: IMailingLists){
    if(this.currentMessage.mailingId == newData_s.id){this.setCurrentMailing(newData_s.id)}
    let numberOfArr = this.module.checkArrOfObjIdValField(this.dataMailingList, 'id', newData_s.id);
    if(numberOfArr>=0){
      this.dataMailingList.splice(numberOfArr, 1, newData_s);
      this.mailingList.next(this.dataMailingList);
      return
    }
    else {
      this.dataMailingList.unshift(newData_s);
      this.mailingList.next(this.dataMailingList);
    }
  }

//-------------------------------------------------------------------------------------------------
// списки листів
  
subMessageList: Subscription; //підписка на початковий список розсилки
messageList: BehaviorSubject<IMessageInfo[]> = new BehaviorSubject([]); // Observable для списку розсилки
dataMessageList: IMessageInfo[] = []; //останні данні по mailingList

//підписка на початковий список розсилки
getSubMessageList(){
  this.subMessageList = this.server.getAll('getAllMessages')
    .pipe(map((vl: any, i) => Array.from(vl)))
    .subscribe((data: IMessageInfo[]) => {
      this.messageList.next(data);
      this.subMessageList.unsubscribe()
    });
  //внутрішня підписка на список розсилки
  this.messageList.subscribe((data_m: IMessageInfo[]) => this.dataMessageList=data_m)
}

//додаємо або заміняємо існуючучий лист, новим листом (обробник події сокета)
handlerCreateEditMessage(newData_s: IMessageInfo){
  // визначаємо індекс елемента в масиві
  let numberOfArr = this.module.checkArrOfObjIdValField(this.dataMessageList, 'id', newData_s.id);
  if(numberOfArr>=0){
    this.dataMessageList.splice(numberOfArr, 1, newData_s);
    this.messageList.next(this.dataMessageList);
    return
  }
  else {
    this.dataMessageList.unshift(newData_s);
    this.messageList.next(this.dataMessageList);
    return
  }
}

//-------------------------------------------------------------------------------------------------

}
