import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from './../shared/db.service';
import { Key } from 'protractor';

@Component({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css']
})
export class DbComponent implements OnInit {

  nav = this.db.navDB;
  user = localStorage.getItem('user');

  constructor(
    private router: Router,
    private db: DbService,
  ) { }

  ngOnInit() {
  }

  getItemMenu(item){
    this.db.setNavDB(item);
  }

  exit(){
    localStorage.clear();
    this.router.navigate(['auth']);
  }



  // //моє посилання на реєстрацію
  // registerUrl = 'https://visitors.galexpo.com.ua:4202/user/login?idex=314';

  // //посилання за яким користувач потрапив на сайт
  // currentUrl = window.location;

  // //оголошуємо обєкт utm
  // utm = {
  //   utm_source: '',
  //   utm_medium: '',
  //   utm_campaign: '',
  //   utm_term: '',
  //   utm_content: ''
  // }

  // // функція яка повертає готове посилання з utm де:
  // // urlPage - посилання за яким користувач потрапив на сайт
  // // urlForm - посилання на реєстрацію
  // // objUtm - обєкт utm
  // setRegisterUrl(urlPage, urlForm, objUtm){
  //   var myURL = new URL(urlPage);
  //   var formURL = new URL(urlForm);
  //   console.log('myURL: ', myURL);
  //   console.log('formURL: ', formURL);

  //   // перебираємо всі властивості обєкта objUtm та записуємо в них значення з url 
  //   for(var key in objUtm){
  //     if(myURL.searchParams.get(key)){
  //       objUtm[key] = myURL.searchParams.get(key);
  //     }
  //     else {
  //       objUtm[key] = '';
  //     }
  //   }
  //   console.log('objUtm: ', objUtm);

  //   // перебираємо всі властивості обєкта objUtm та додаємо utm в formURL
  //   for (var key in objUtm){
  //     formURL.searchParams.set(key, objUtm[key])
  //   }

  //   return formURL.href;
  // }

  // //посилання на реєстрацію з utm
  // registerUrlComplete = this.setRegisterUrl(this.currentUrl, this.registerUrl, this.utm);
  

}
