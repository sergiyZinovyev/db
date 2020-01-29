import { Component, ChangeDetectionStrategy, OnInit, OnDestroy} from '@angular/core';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../../../shared/mail.service';
import { DbService } from '../../../shared/db.service';
import { IUser, IMessage, Ifiles} from '../mailInterface';
import { element } from 'protractor';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-emaillist',
  templateUrl: './emaillist.component.html',
  styleUrls: ['./emaillist.component.css'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmaillistComponent implements OnInit, OnDestroy { 

  isLoadingResults = true;
  emailList: IUser[];
  //mailingId: number; //визначає активну розсилку
  subMessage: Subscription;
  progressValue: number = 60;
  mailingStatus: 'sent'|'no_sent'|'sending' = 'sent';

  constructor(
    private mail: MailService,
    private db: DbService,
    private server: ServerService,
    private module: ModulesService
  ) { }

  ngOnInit() {

    // if(!this.mail.subMailingList){
    //   this.mail.getSubMailingList(); //запускаємо на сервісі підписку на MailingList    
    //   console.log('MailingList subscribed!!!');
    // }
    
    // підписуємось на mailingList
    this.subMessage = this.mail.getMessage.subscribe((data: IMessage)  => {
      console.log('data: ', data);
      // this.emailList = [];
      // setTimeout(() => {
      //   this.emailList = data.sendList;
      // });
      console.log('data.mailimgStatus: ',data.mailingStatus);
      if(data.mailingStatus){
        this.mailingStatus = data.mailingStatus;
        console.log('this.mailingStatus: ',this.mailingStatus)
      };
      this.emailList = data.sendList;
      this.isLoadingResults = false;
      this.progressValue = this.countSent(this.emailList)/this.emailList.length*100;
    });

    // підписуємося на визначення активної розсилки
    //this.mail.getMessage.subscribe(data => this.mailingId = data.mailingId); 
  }

  countSent(arr: IUser[]){
    return arr.reduce((total, amount) => {
      if(amount.is_send == 'sent'){
        total++;
      }
      return total
    },0)
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

  getUserData(id: number): void{
    console.log(`user ${id} selected`);
  }

  clearEmailList(){
    this.mail.clearCurrentSendList();
  }

  addEmailList(){
    this.db.setNavDB('visitors');
  }

  delEmail(id: number): void{
    this.mail.removeFromCurrentSendList(id);
  }

  ngOnDestroy(){
    this.subMessage.unsubscribe();
  }
}
