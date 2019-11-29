import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {

  isAddingItemSendEmail: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  newElement(element: string){
    console.log('element: ',element);
    this[element] = !this[element];
  }

} 
