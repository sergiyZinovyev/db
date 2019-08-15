import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';

//const apiUrl = 'http://localhost:7001'; //dev host
//const apiUrl = 'http://192.168.5.107:7001'; //prod host


@Injectable({
  providedIn: 'root'
})

export class ServerService {

  frontURL: URL;
  apiUrl = 'http://localhost:7001'; //dev host
  //apiUrl = 'http://192.168.5.107:7001'; //prod host

  constructor(
    private http: HttpClient
  ) { }

  setFrontURL(url){
    if (this.frontURL){return console.log('url not change - ', this.frontURL)}
    this.frontURL = new URL(url);
    console.log(this.frontURL);
  }

  post(value, prop) {
    return this.http.post(`${this.apiUrl}/${prop}`, value)    
  }
  
  get(prop){
    return this.http.get(`${this.apiUrl}/db/${prop}`)
  }

  getStringExhibForm(exhibForm: {}): string{
    //перетворення форми(об'єкту) в список обраних виставок
    let exhibStr: string = '';
    for(var key in exhibForm){
      if(exhibForm[key]==true){
        exhibStr=exhibStr+key+', ';
      }
      else{
        exhibStr=exhibStr+', ';
      }
    }
    console.log(exhibStr);
    return exhibStr
  }

  getExhib(nameTable){
    let exhibForm = new FormGroup({});
    this.get(nameTable).subscribe(data =>{
      let exhib = new Array;
      let value: boolean;
      for(let i=0; i>=0; i++){
        value = false;
        if(!data[i]){break};
        exhib.push({
          id: data[i].id,
          name: data[i].name,
          kod: data[i].kod
        })
        //if(this.getArrFromPotvid().find(currentValue => currentValue == data[i].name) || data[i].name == this.myExhib){value = true}
        exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
      }
      console.log('exhib', exhib);
      // this.exhibForm.valueChanges.subscribe(v => {
      //   this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками в загальній формі
      // });
    })
  }




  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
