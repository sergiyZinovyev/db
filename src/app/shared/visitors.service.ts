import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../shared/server.service';
import { ModulesService } from '../shared/modules.service';

import { ISocketEvent } from '../shared/common_interfaces/interfaces';
import { IVisitor } from '../db/visitors/visitorsinterface';

class SubData {
  data: IVisitor[];
  state: boolean;
  constructor(data: IVisitor[], state: boolean) {
    this.data = data;
    this.state = state
  }
}

@Injectable({
  providedIn: 'root'
})
export class VisitorsService {

  sub_visitors: Subscription;
  visitors: BehaviorSubject<SubData> = new BehaviorSubject(new SubData(new Array(), false));

  sub_model_visitors: Subscription;
  model_visitors: SubData;

  sub_visitors_create: Subscription;
  visitors_create: BehaviorSubject<SubData> = new BehaviorSubject(new SubData(new Array(), false));

  sub_model_visitors_create: Subscription;
  model_visitors_create: SubData;

  sub_visitors_edit: Subscription;
  visitors_edit: BehaviorSubject<SubData> = new BehaviorSubject(new SubData(new Array(), false));

  sub_model_visitors_edit: Subscription;
  model_visitors_edit: SubData;

  constructor(
    private module: ModulesService,
    private server: ServerService
  ) { }

  getVisitors(nameTable: 'visitors'|'visitors_create'|'visitors_edit'): void{
    this[nameTable].next(new SubData(new Array(), false));
    this['sub_'+nameTable] = this.server.getVisitors(nameTable).pipe(
      map((vl:any): IVisitor[] => Array.from(vl))
    ).subscribe(data=>{
      console.log('data from getVisitors: ', data);
      this['sub_'+nameTable].unsubscribe();
      this[nameTable].next(new SubData(data, true));
    })
    //this[nameTable].subscribe(data => this['model_'+nameTable] = data);
  }

  getModel(nameTable: 'visitors'|'visitors_create'|'visitors_edit'): void{
    this[nameTable].subscribe(data => this['model_'+nameTable] = data);
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
    this.subSockets = this.server.socketMessage.subscribe((data_s: ISocketEvent) => {
      //console.log('Socket data: ',data_s);
      switch (data_s.event) {

        case 'break connection':
          console.log('server crash, you need to restart the data');
          console.log('Socket data: ',data_s);
          this.handlerBreakConnection();
          break;

        case 'getDelData': 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement getDelData');
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',data_s);
          // функція обробник сокета
          this.handlerGetDelData(data_s.data);
          break;

        case 'editVisitor': 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement editVisitor');
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',data_s);
          // функція обробник сокета
          this.handlerEditVisitor(data_s.data);
          break;

        case 'createVisitor': 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement createVisitor');
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',data_s);
          // функція обробник сокета
          this.handlerCreateVisitor(data_s.data);
          break;
      
        default: break;
      }
    });
  }

//---------------------------------------------------------------------------------------------------------------------------
//event socket handlers

  // refresh all data table
  handlerBreakConnection(): void{
    this.getVisitors('visitors');
    this.getVisitors('visitors_create');
    this.getVisitors('visitors_edit');
  }

  // remove selected entries
  handlerGetDelData(socketData: {table: string, id: any}): void{
    //console.log('handlerGetDelData is work');
    let modelData: IVisitor[] = this['model_' + socketData.table].data;
    let stringId: string | number = socketData.id;
    if (typeof stringId == 'number') stringId = String(stringId);
    let socketDataId = stringId.split(', ');
    let id: number;
    for (let index = 0; index < socketDataId.length; index++) {
      const element = socketDataId[index];
      id = this.module.checkArrOfObjIdValField(modelData, 'regnum', element);
      if(!id) continue;
      if(id >= 0){
        modelData.splice(id, 1);
      }
    }
    this[socketData.table].next(new SubData(modelData, true));
  }

  handlerEditVisitor(socketData){}

  // add new entries
  handlerCreateVisitor(socketData: {table: string, data: IVisitor[]}): void{
    let modelData: IVisitor[] = this['model_' + socketData.table].data;
    //let id: number;
    for (let index = 0; index < socketData.data.length; index++) {
      const element = socketData.data[index];
      //id = this.module.checkArrOfObjIdValField(modelData, 'regnum', element.regnum);
      modelData.push(element);
    }
    this[socketData.table].next(new SubData(modelData, true));
  }

} 
