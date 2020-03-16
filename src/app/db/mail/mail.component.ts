import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MailService } from './mail.service';
import { ServerService } from '../../shared/server.service';
import {IUser, IMessage, Ifiles} from '../mail/mailInterface';

class Data {
  subject: string; 
  visible: boolean;
  constructor(subject: string, sendList: IUser[]) {
    this.subject = subject;
    this.visible = sendList.length>0?true:false
  }
}

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit, OnDestroy {

  subMessage: Subscription;

  //isAddingItemSendEmail: boolean = true;
  nameMailing: string = 'Новий лист';
  visible: boolean;

  constructor(
    private mail: MailService,
    private server: ServerService,
  ) { }
 
  ngOnInit() {
     //підписуємося на getMessage, щоб отримати назву листа
    this.subMessage = this.mail.getMessage.pipe(
      map((vl:IMessage):Data => new Data(vl.subject, vl.sendList))
    ).subscribe((data)  => {
      this.nameMailing = data.subject;
      this.visible = data.visible;
      console.log('this.visible: ',this.visible)
    });

    if(!this.mail.subSockets){
      this.mail.getSubSockets(); //запускаємо на сервісі підписку на сокети 
      console.log('Sockets subscribed!!!');
    }
   
  }

  newMailing(){
    this.mail.setNewMessage();
    this.nameMailing = 'Новий лист';
  }

  ngOnDestroy(){
    this.subMessage.unsubscribe();
  }

} 
