import { Component, OnInit, HostListener } from '@angular/core';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../mail.service';
import { element } from 'protractor';
import { map } from 'rxjs/operators';
import {IUser, IMessage, Ifiles} from '../mailInterface';
import { Message } from '../message';

@Component({
  selector: 'app-mailinglist',
  templateUrl: './mailinglist.component.html',
  styleUrls: ['./mailinglist.component.css']
})
export class MailinglistComponent implements OnInit {

  isLoadingResults = true;
  mailingList
  mailingId: number; //визначає активну розсилку

  constructor(
    private mail: MailService,
    private server: ServerService,
    private module: ModulesService
  ) { }

  ngOnInit() {
    if(!this.mail.subMailingList){
      this.mail.getSubMailingList(); //запускаємо на сервісі підписку на MailingList      
      console.log('MailingList subscribed!!!');
    }
    
    // підписуємось на mailingList
    this.mail.mailingList.subscribe(data => {
      this.mailingList = [...data];
      this.mailingList = this.mailingList.sort(this.module.compareByField('id'));
      this.isLoadingResults = false;
    });

    // підписуємося на визначення активної розсилки 
    this.mail.getMessage.pipe(map((vl:Message):number => vl.mailingId)).subscribe(data => this.mailingId = data); 
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

  compareNumeric(a, b) {
    if (a.date_end < b.date_end) return 1;
    if (a.date_end == b.date_end) return 0;
    if (a.date_end > b.date_end) return -1;
  }

  getMessage(id: number): void{
    // this.mail.setIsAddingItemSendEmail(false);
    // setTimeout(() => {
      this.mail.setCurrentMailing(id);
    // });    
  }

  delMessage(){
    console.log('delMessage is work!')
  }

  

}
