import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MailService } from '../../shared/mail.service';
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

  constructor(
    private mail: MailService,
  ) { }
 
  ngOnInit() {
    this.subStatus = this.mail.isAddingItemSendEmail.subscribe(data => this.isAddingItemSendEmail = data)
    this.subMessage = this.mail.getMessage.subscribe((data: IMessage)  => {
      this.nameMailing = data.subject;
    })
  }

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
