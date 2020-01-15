import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MailService } from '../../shared/mail.service';
import { ServerService } from '../../shared/server.service';
import {IUser, IMailig, IMessage, Ifiles} from '../mail/mailInterface';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit, OnDestroy {

  subStatus: Subscription;
  subMessage: Subscription;

  isAddingItemSendEmail: boolean = true;
  nameMailing: string = 'Новий лист';


  // connection = new WebSocket(this.server.wssUrl);
  // connection2 = this.server.wss;

  constructor(
    private mail: MailService,
    private server: ServerService,
  ) { }
 
  ngOnInit() {
    this.subStatus = this.mail.isAddingItemSendEmail.subscribe(data => this.isAddingItemSendEmail = data);
    this.subMessage = this.mail.getMessage.subscribe((data: IMessage)  => {
      this.nameMailing = data.subject;
    });

    if(!this.mail.subSockets){
      this.mail.getSubSockets(); //запускаємо на сервісі підписку на сокети
      console.log('Sockets subscribed!!!');
    }
    // this.server.wss.onopen = function(e) {
    //   console.log("[open] Connection established");
    //   console.log("Отправляем данные на сервер");
    // }

    // console.log(this.connection);
    // console.log(this.connection2);

    // this.connection.onopen = function(e) {
    //   console.log("[open] Connection");
    //   console.log("Отправляем данные на сервер");
    // }
    //this.server.openSocket();

    // this.connection.onmessage = function(event) {
    //   console.log('[message] Данные получены с сервера:', event);
    //   if(event.data != `socket connect` && event.data != `test message`){
    //     let message = event.data;
    //     console.log(JSON.parse(message));
    //   }
    // };

    // this.server.wss.onmessage = function(event) {
    //   console.log('[message] Данные получены с сервера:', event);
    //   if(event.data != `socket connect` && event.data != `test message`){
    //     let message = event.data;
    //     console.log(JSON.parse(message));
    //   }
    // };

    //this.server.onSocket().subscribe(data => console.log('Socket data: ',data));
    //this.server.socketMessage
    //console.log('Socket data: ',this.server.onSocket());

  }

  // sendSocket(message){
  //   this.connection.send(message)
  // }

  newElement(element: string){
    console.log('element: ',element);
    this[element] = !this[element];
  }

  newMailing(){
    this.mail.setIsAddingItemSendEmail(false);
    setTimeout(() => {
      this.mail.setIsAddingItemSendEmail(true);
      this.nameMailing = 'Новий лист';
    }); 
  }

  ngOnDestroy(){
    this.subStatus.unsubscribe();
  }

} 
