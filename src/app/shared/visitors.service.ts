import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../shared/server.service';
import { ModulesService } from '../shared/modules.service';
import { IVisitor } from '../db/visitors/visitorsinterface';

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  sub_visitors: Subscription;
  visitors: BehaviorSubject<IVisitor[]> = new BehaviorSubject(new Array());

  sub_visitors_create: Subscription;
  visitors_create: BehaviorSubject<IVisitor[]> = new BehaviorSubject(new Array());

  sub_visitors_edit: Subscription;
  visitors_edit: BehaviorSubject<IVisitor[]> = new BehaviorSubject(new Array());

  constructor(
    private module: ModulesService,
    private server: ServerService
  ) { }

  getVisitors(nameTable: 'visitors'|'visitors_create'|'visitors_edit'): void{
    this[nameTable].next(new Array());
    this['sub_'+nameTable] = this.server.getVisitors(nameTable).pipe(
      map((vl:any): IVisitor[] => Array.from(vl))
    ).subscribe(data=>{
      console.log('data from getVisitors: ', data);
      this['sub_'+nameTable].unsubscribe();
      this[nameTable].next(data);
    })
    //return new BehaviorSubject(new Array());
  }

//---------------------------------------------------------------------------------------------------------------------------

  subSockets: Subscription; //підписка на сокети

  //підписатися на сокети
  getSubSockets(){
    if(!this.server.wss.onmessage){
      console.log('~~~~~~~~~~~~~~~~ run socket listening ~~~~~~~~~~~~~~~~');
      this.server.onSocket();
    }
    else console.log('~~~~~~~~~~~~~~~~ sockets are already listening ~~~~~~~~~~~~~~~~');
    this.subSockets = this.server.socketMessage.subscribe((data_s: {event: string, data: any}) => {
      //console.log('Socket data: ',data_s);
      switch (data_s.event) {

        case 'break connection':
          console.log('падіння сервера, потрібно перезавантажити дані');
          console.log('Socket data: ',data_s);
          this.getVisitors('visitors');
          // функція обробник сокета
          break;

        case 'getDelData': 
          console.log('виконуємо getDelData');
          console.log('Socket data: ',data_s);
          // функція обробник сокета
          break;
      
        default: break;
      }
    });
  }

} 
