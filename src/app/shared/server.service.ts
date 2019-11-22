import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, throwError  } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ServerService {
  exhib = {
    id: 2,
    name: ''
  }; 
  frontURL: URL;
  //apiUrl = 'http://localhost:7001'; //dev host  
  //apiUrl = 'http://192.168.5.107:7001'; //prod host ge
  //apiUrl = 'http://31.41.221.156:7001'; //www host test
  //apiUrl = 'https://visitors.galexpo.com.ua:7001'; //prod host   
  apiUrl = 'https://visitors.galexpo.com.ua:7002'; //dev host  

  dataVisex;

  idex;

  constructor(
    private http: HttpClient
  ) { }

   
  setFrontURL(url){
    if (this.frontURL){return console.log('url not change - ', this.frontURL)}
    this.frontURL = new URL(url);
    this.idex = this.frontURL.searchParams.get('idex');
    console.log(this.frontURL);
    console.log('idex: ', this.idex);
  }

  setExhib(id, name){
    this.exhib = {
      id: id,
      name: name
    }
    console.log('this.exhib: ',this.exhib); 
  }

  getAuth(){ //дані для аутентифікації
    return `login=${localStorage.getItem('user')}&password=${localStorage.getItem('password')}`
  }

  getAll(prop, id?, q1?, q2?, q3?, q4?){ //універсальний метод де prop - назва роута на сервері, id?, q1, ... - параметри запиту
    return this.http.get(`${this.apiUrl}/${prop}?${this.getAuth()}&id=${id}&q1=${q1}&q2=${q2}&q3=${q3}&q4=${q4}`)
  }

  post(value, prop) {
    return this.http.post(`${this.apiUrl}/${prop}?${this.getAuth()}`, value)    
  }
  
  get(prop){
    return this.http.get(`${this.apiUrl}/db/${prop}?${this.getAuth()}`)
  }

  getCheckViv(idVis, exhib){ //перевірка чи зареєстрований відвідувач  
    return this.http.get(`${this.apiUrl}/checkViv/?${this.getAuth()}&idVis=${idVis}&exhib=${exhib}`)
  }

  getVisExhib(prop, cond?){
    return this.http.get(`${this.apiUrl}/visexhib/${prop}?${this.getAuth()}&cond=${cond}`)
  }

  getVisitors(prop, id?){
    if(!id){
      return this.http.get(`${this.apiUrl}/visitors/${prop}?${this.getAuth()}`)
    }
    else{
      return this.http.get(`${this.apiUrl}/visitors/${prop}?${this.getAuth()}&id=${id}`)
    }
    
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

  // getExhib(nameTable: string, arrFromFormControl: [], arrFromMyExhib): [FormGroup, {id: string, name: string, kod: string}[]]{
  //   //створити форму зі всіх виставок
  //   let exhibForm = new FormGroup({});
  //   let exhib = new Array;
  //   this.get(nameTable).subscribe(data =>{
  //     let value: boolean;
  //     for(let i=0; i>=0; i++){
  //       value = false;
  //       if(!data[i]){break};
  //       exhib.push({
  //         id: data[i].id,
  //         name: data[i].name,
  //         kod: data[i].kod
  //       })
  //       if(arrFromFormControl.find(currentValue => currentValue == data[i].name) || arrFromMyExhib.find(currentValue => currentValue == data[i].name)){value = true}
  //       exhibForm.addControl(data[i].name, new FormControl(value, Validators.required))
  //     }
  //     //console.log('exhibForm: ', exhibForm);
  //     // this.exhibForm.valueChanges.subscribe(v => {
  //     //   this.loginForm.patchValue({potvid: this.server.getStringExhibForm(this.exhibForm.value)}) //змінюємо поле з виставками в загальній формі
  //     // }); 
  //   })
  //   return [exhibForm, exhib]
  // }

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

 

  accessIsDenied(data){
    if(data == 'false'){
      alert('Access is denied \n\nУ вас немає прав для здійснення цієї операції');
      return true
    } 
  }

  private handleError(err) {
    console.log('caught mapping error and rethrowing', err);
    return throwError(err);
  }

}
