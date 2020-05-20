import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../../shared/server.service';
import { ModulesService } from '../../shared/modules.service';

import { ISocketEvent } from '../../shared/common_interfaces/interfaces';
import { IVisitor } from './visitorsinterface';
import {Fields} from './fields';

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
    private server: ServerService,
    private fields: Fields
  ){}

  setDisplayedColumns(columns: string[]){
    this.fields.setFields(columns);
  }

  addColToModel(columns: string[], nameTable){
    this.fields.setFields(columns);
    this.getVisitors(nameTable);
    // columns.push('regnum');
    // let reqBody = {
    //   table: nameTable,
    //   fields: columns
    // }
    // console.log('reqBody: ', reqBody);
    // this.server.post(reqBody, 'visitors').pipe(
    //   map((vl:any): IVisitor[] => Array.from(vl))
    // ).subscribe(data=>{
    //   console.log('data from visitors: ', data);
    //   let model = this['model_'+nameTable].data;
    //   console.log('model: ', model);
    //   data.forEach(element => {
    //     let id = this.module.checkArrOfObjIdValField(model, 'regnum', element.regnum);
    //     let key = columns[0];
    //     console.log('key: ', key);
    //     if(id && !model[id][key]){
    //       model[id][key] = element[key]
    //     }
    //   });
    //   this[nameTable].next(new SubData(data, true));
    //   this.eventController();
    // })
  }

  delDisplayedColumns(column: string){
    this.fields.delField(column)
  }

  getAllColumns(){
    return this.fields.allColumns()
  }

  getVisitors(nameTable: 'visitors'|'visitors_create'|'visitors_edit'): void{
    let reqBody = {
      table: nameTable,
      fields: this.fields.selected()
    }
    this[nameTable].next(new SubData(new Array(), false));
    this['sub_'+nameTable] = this.server.post(reqBody, 'visitors').pipe(
      map((vl:any): IVisitor[] => Array.from(vl))
    ).subscribe(data=>{
      //console.log('data from getVisitors: ', data);
      this['sub_'+nameTable].unsubscribe();
      this[nameTable].next(new SubData(data, true));
      this.eventController();
    })
  }

  getModel(nameTable: 'visitors'|'visitors_create'|'visitors_edit'): void{
    this['sub_model_'+nameTable] = this[nameTable].subscribe(data => this['model_'+nameTable] = data);
  }

//---------------------------------------------------------------------------------------------------------------------------

  subSockets: Subscription; //підписка на сокети

  eventsBuffer = []; // буфер даних сокета

  //підписатися на сокети
  getSubSockets(){
    let eventNames = ['break connection', 'getDelData', 'getNewDataVisitors'];
    if(!this.server.wss.onmessage){
      console.log('~~~~~~~~~~~~~~~~ run socket listening ~~~~~~~~~~~~~~~~');
      this.server.onSocket();
    }
    else console.log('~~~~~~~~~~~~~~~~ sockets are already listening ~~~~~~~~~~~~~~~~');
    this.subSockets = this.server.socketMessage.subscribe((data_s: ISocketEvent) => {
      if(eventNames.includes(data_s.event)){
        this.eventsBuffer.push(data_s);
        this.eventController();
      }
    });
  }

  // event socket controller 
  eventController(){
    console.log('************************* this.eventsBuffer 2: ', this.eventsBuffer);
    const arr = this.eventsBuffer.slice();
    for (let index = 0; index < arr.length; index++) {
      console.log(`!!!!!!!!!!!!!!!!!!!!!! start 'for' for index ${index} !!!!!!!!!!!!!!!!!!!!!!`);
      console.log('--------------------- arr.length: ', arr.length);
      const eventBuffer = arr[index];
      switch (eventBuffer.event) {

        case 'break connection':
          console.log('server crash, you need to restart the data');
          console.log('Socket data: ',eventBuffer);
          this.handlerBreakConnection();
          this.eventsBuffer.splice(index, 1); 
          break;

        case 'getDelData':
          if(!this['model_' + eventBuffer.data.table].state) break; 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement getDelData');
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',eventBuffer);
          
          // функція обробник сокета
          this.handlerGetDelData(eventBuffer.data);
          this.eventsBuffer.splice(index, 1);
          break;

        case 'getNewDataVisitors':
          if(!this['model_' + eventBuffer.data.table].state) break; 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement getNewDataVisitors');
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',eventBuffer);
          
          // функція обробник сокета
          this.handlerEditVisitor(eventBuffer.data);
          this.eventsBuffer.splice(index, 1);
          break;

        default: break;
      }
      console.log(`!!!!!!!!!!!!!!!!!!!!!! end 'for' for index ${index} !!!!!!!!!!!!!!!!!!!!!!`);
      console.log('--------------------- arr.length: ', arr.length);
    }
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
    let modelData: IVisitor[] = this['model_' + socketData.table].data;
    let stringId: string | number = socketData.id;
    if (typeof stringId == 'number') stringId = String(stringId);
    let socketDataId = stringId.split(', ');
    let id: number;
    for (let index = 0; index < socketDataId.length; index++) {
      const element = socketDataId[index];
      id = this.module.checkArrOfObjIdValField(modelData, 'regnum', element);
      if(id == undefined) continue;
      else{
        modelData.splice(id, 1);
      }
    }
    this[socketData.table].next(new SubData(modelData, true));
  }

  // edit/add entries
  handlerEditVisitor(socketData: {table: string, data: IVisitor[]}): void{
    let modelData: IVisitor[] = this['model_' + socketData.table].data;
    for (let index = 0; index < socketData.data.length; index++) {
      const element = socketData.data[index];
      const id = this.module.checkArrOfObjIdValField(modelData, 'regnum', element.regnum);
      if(id == undefined) modelData.push(element);
      else{
        modelData.splice(id, 1, element);
      }
    }
    this[socketData.table].next(new SubData(modelData, true));
  }
} 
