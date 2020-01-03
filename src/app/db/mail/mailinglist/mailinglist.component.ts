import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mailinglist',
  templateUrl: './mailinglist.component.html',
  styleUrls: ['./mailinglist.component.css']
})
export class MailinglistComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  getMessage(){
    console.log('getMessage is work!')
  }

}
