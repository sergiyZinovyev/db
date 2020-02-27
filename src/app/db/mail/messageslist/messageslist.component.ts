import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../mail.service';
import { element } from 'protractor';
import { map } from 'rxjs/operators';
import {IUser, IMessage, IMailingLists, IMessageInfo} from '../mailInterface';
import { Message } from '../message';

@Component({
  selector: 'app-messageslist',
  templateUrl: './messageslist.component.html',
  styleUrls: ['./messageslist.component.css']
})
export class MessageslistComponent implements OnInit {

  messageList: IMessageInfo[];
  messageId: number | string; //визначає активну розсилку 

  constructor(
    private mail: MailService,
    private server: ServerService,
    private module: ModulesService
  ) { }

  ngOnInit() {

    if(!this.mail.subMessageList){
      this.mail.getSubMessageList(); //запускаємо на сервісі підписку на MessageList 
      console.log('MessageList subscribed!!!');
    }
    
    // підписуємось на messageList
    this.mail.messageList.subscribe(data => this.messageList = data);

    // підписуємося на визначення активної розсилки
    this.mail.getMessage.pipe(map((vl:Message):number | string => vl.id)).subscribe(data => this.messageId = data);  

  }

  dateFormat(d){
    if(d){
      var now = new Date(d);
      var curr_date = ('0' + now.getDate()).slice(-2)
      var curr_month = ('0' + (now.getMonth() + 1)).slice(-2);
      var curr_year = now.getFullYear();
      var curr_hour = ('0' + now.getHours()).slice(-2);
      var curr_minute = ('0' + now.getMinutes()).slice(-2);
      var curr_second = ('0' + now.getSeconds()).slice(-2);
      var formated_date = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
    }
    else {return null};
    return formated_date;
  }

  getMessage(id: number): void{
    // this.mail.setIsAddingItemSendEmail(false);
    // setTimeout(() => {
      this.mail.setCurrentMessage(id);
    // });    
  }

  delMessage(){
    console.log('delMessage is work!')
  }

}
