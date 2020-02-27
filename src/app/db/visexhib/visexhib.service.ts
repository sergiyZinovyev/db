import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../../shared/server.service';
import { ModulesService } from '../../shared/modules.service';

import { ISocketEvent } from '../../shared/common_interfaces/interfaces'; 
import { IVisitorExhib } from '../visexhib/visexhibinterface';

class SubData {
  constructor(public data: IVisitorExhib[], public state: 'pending'|'ready'|'off') {}
}

@Injectable({
  providedIn: 'root'
})
export class VisexhibService {

  sub_visex: Subscription;
  visex: BehaviorSubject<SubData> = new BehaviorSubject(new SubData(new Array(), 'pending'));

  sub_getType: Subscription;
  typeOfReg: BehaviorSubject<string> = new BehaviorSubject('');

  sub_model_visex: Subscription;
  model_visex: SubData;

  subSockets: Subscription; //socket subscription
  eventsBuffer = []; // socket data buffer

  constructor(
    private module: ModulesService,
    private server: ServerService
  ) { }

  getVisex(idExhib: number): void{
    this.visex.next(new SubData(new Array(), 'pending'));
    this.sub_visex = this.server.getVisExhib(idExhib).pipe(
      map((vl:any): IVisitorExhib[] => Array.from(vl))
    ).subscribe(data=>{
      //this.sub_visex.unsubscribe();
      this.visex.next(new SubData(data, 'ready'));
      this.eventController();
    })
  }

  getModel(): void{
    this.sub_model_visex = this.visex.subscribe(data => this.model_visex = data);
  }

  getTypeOfreg(idExhib){
    this.sub_getType = this.server.getAll("getAll", idExhib, 'numexhib', 'exhibitions').subscribe(data=>{
      console.log('typeOfReg: ', data);
      this.typeOfReg.next(data[0].typeOfReg);
      //this.sub_getType.unsubscribe();
    });
  }
  

  //---------------------------------------------------------------------------------------------------------------------------

  

  //підписатися на сокети
  getSubSockets(){
    let eventNames = ['break connection', 'getNewDataVisitorsExhib', 'getTypeOfReg'];
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

        case 'getTypeOfReg':
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ Socket data: ',eventBuffer);
          this.handlerEditTipeOfReg(eventBuffer.data);
          this.eventsBuffer.splice(index, 1); 
          break;

        case 'getNewDataVisitorsExhib':
          if(this.model_visex.state == 'off') {
            this.eventsBuffer.splice(index, 1);
            break
          } 
          if(this.model_visex.state == 'pending') break; 
          console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$ implement getNewDataVisitorsExhib');
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
    this.getVisex(this.model_visex.data[0].id_exhibition);
  }

  // get new type of regestration
  handlerEditTipeOfReg(socketData: { typeOfReg: string, numexhib: string }): void{
    console.log('handlerEditTipeOfReg works');
    if(Number(socketData.numexhib) != this.model_visex.data[0].id_exhibition) return 
    this.typeOfReg.next(socketData.typeOfReg);
  }

  // edit/add entries
  handlerEditVisitor(socketData: IVisitorExhib[]): void{
    if(socketData[0].id_exhibition != this.model_visex.data[0].id_exhibition) return  
    let modelData: IVisitorExhib[] = this.model_visex.data;
    for (let index = 0; index < socketData.length; index++) {
      const element = socketData[index];
      const id = this.module.checkArrOfObjIdValField(modelData, 'id_vis', element.id_vis);
      if(id == undefined) modelData.push(element);
      else{
        modelData.splice(id, 1, element);
      }
    }
    this.visex.next(new SubData(modelData, 'ready'));
  }

//---------------------------------------------------------------------------------------------------------------------------

  closedAllSub(){
    this.sub_visex.unsubscribe();
    this.sub_visex = undefined;
    this.visex.next(new SubData(new Array(), 'off'));
    this.sub_model_visex.unsubscribe();
    this.sub_model_visex = undefined;
    this.sub_getType.unsubscribe();
    this.sub_getType = undefined;
    this.subSockets.unsubscribe();
    this.subSockets = undefined;
    this.eventsBuffer = [];
  }


} 


