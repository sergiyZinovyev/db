import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';


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

  getExhib(nameTable: string, arrFromFormControl: [], arrFromMyExhib): [FormGroup, {id: string, name: string, kod: string}[]]{
    //створити форму зі всіх виставок
    let exhibForm = new FormGroup({});
    let exhib = new Array;
    this.get(nameTable).subscribe(data =>{
      let value: boolean;
      for(let i=0; i>=0; i++){
        value = false;
        if(!data[i]){break};
        exhib.push({
          id: data[i].id,
          name: data[i].name,
          kod: data[i].kod
        })
        if(arrFromFormControl.find(currentValue => currentValue == data[i].name) || arrFromMyExhib.find(currentValue => currentValue == data[i].name)){value = true}
        exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
      }
      //console.log('exhibForm: ', exhibForm);
      // this.exhibForm.valueChanges.subscribe(v => {
      //   this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками в загальній формі
      // }); 
    })
    return [exhibForm, exhib]
  }

  // getRegion(nameTable){
  //   let region = [];
  //   let get = this.get(nameTable).subscribe(data =>{
  //     for(let i=1; i<=25; i++){
  //       region.push({
  //         regionid: data[i].regionid,
  //         teretory: data[i].teretory
  //       })
  //     }
  //     console.log(region);
  //     get.unsubscribe();
  //     return region
  //   })
  // }


  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
