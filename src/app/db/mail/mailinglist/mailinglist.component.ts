import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../shared/server.service';
import { ModulesService } from '../../../shared/modules.service';
import { MailService } from '../../../shared/mail.service';
import { element } from 'protractor';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-mailinglist',
  templateUrl: './mailinglist.component.html',
  styleUrls: ['./mailinglist.component.css']
})
export class MailinglistComponent implements OnInit {

  mailingList

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
    
    this.mail.mailingList.subscribe(data => this.mailingList = data); 

    //this.mail.getSubMailingList().subscribe(data => this.mailingList = data);

    // this.server.getAll('getMailingList')
    //   .pipe(map((vl: any, i) => Array.from(vl)))
    //   .subscribe(data => this.mailingList = data)



    // this.server.getAll('getMailingList').subscribe(data=>{
    //   this.mailingList = [];
    //   for(let i=0; i>=0; i++){
    //     if(!data[i]){break};
    //     this.mailingList.push({
    //       id: data[i].id,
    //       name: data[i].name, 
    //       user_id: data[i].user_id,
    //       realname: data[i].realname, 
    //       date_end: this.dateFormat(data[i].date_end)
    //     })
    //     //this.i = i+1; //обраховує загальну кількість елементів, якщо потрібно
    //   }
    //   //console.log('this.mailingList: ', this.mailingList)
    // })
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
    this.mail.setIsAddingItemSendEmail(false);
    setTimeout(() => {
      this.mail.setCurrentMailing(id);
    });    
  }

  delMessage(){
    console.log('delMessage is work!')
  }

}
