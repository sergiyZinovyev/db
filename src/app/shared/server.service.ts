import { Component, OnInit, Injectable} from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class ServerService {

  //url = 'visitors.galexpo.com.ua:7002'; //dev host
  url = 'visitors.galexpo.com.ua:7001'; //prod host    

  exhib = {
    id: 2,
    name: ''
  }; 

  frontURL: URL;
  apiUrl = `https://${this.url}`;
  wssUrl = `wss://${this.url}`; 
  wss = new WebSocket(this.wssUrl);

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

  //------------------------------------------------------------------------------------------------------------------------------ 
  // методи відправки по http

  getAll(prop, id?, q1?, q2?, q3?, q4?){ //універсальний метод де prop - назва роута на сервері, id?, q1, ... - параметри запиту
    return this.http.get(`${this.apiUrl}/${prop}?${this.getAuth()}&id=${id}&q1=${q1}&q2=${q2}&q3=${q3}&q4=${q4}`)
  }

  post(value, prop) {
    return this.http.post(`${this.apiUrl}/${prop}?${this.getAuth()}`, value)    
  }

  post2(value, prop) {
    const req = new HttpRequest('POST', `${this.apiUrl}/${prop}?${this.getAuth()}`, value, {
      reportProgress: true
    });
    return this.http.request(req)   
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

  // getVisitors(prop, id?){
  //   if(!id){
  //     return this.http.(`${this.apiUrl}/visitors/${prop}?${this.getAuth()}`)
  //   }
  //   else{
  //     return this.http.get(`${this.apiUrl}/visitors/${prop}?${this.getAuth()}&id=${id}`) 
  //   }  
  // }




  //------------------------------------------------------------------------------------------------------------------------------




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

  //------------------------------------------------------------------------------------------------------------------------------ 
  // методи wss

  openSocket(){
    console.log('openSocket is work!');
    this.wss.onopen = () => console.log("[open] Connection established");
  }

  socketMessage: Subject<any> = new Subject();

  onSocket(){

    setInterval(()=>{
      console.log('%csocket.readyState: ' + this.wss.readyState, "color: white; font-weight: bold; background-color: blue; padding: 2px;");
      if (this.wss.readyState != 1) {
        this.socketMessage.next({event: 'break connection', data: this.wss.readyState});
        this.wss = new WebSocket(this.wssUrl);
        this.wss.onmessage = (event) => {
          if(event.data != `socket connect` && event.data != `test message`){
            this.socketMessage.next(JSON.parse(event.data));
          }
        }
      }
    }, 5000);

    this.wss.onmessage = (event) => {
      if(event.data != `socket connect` && event.data != `test message`){
        this.socketMessage.next(JSON.parse(event.data));
      }
    }

  }

}
