import { Injectable } from '@angular/core';
import {Observable, from, Subject, BehaviorSubject, Subscription} from 'rxjs';
import { map } from 'rxjs/operators';

import { ServerService } from '../../shared/server.service';
import { ModulesService } from '../../shared/modules.service';

import { ISocketEvent } from '../../shared/common_interfaces/interfaces';
import { IVisitorExhib } from '../visexhib/visexhibinterface';

class SubData {
  constructor(data: IVisitorExhib[], state: 'pending'|'ready'|'off') {}
}

@Injectable({
  providedIn: 'root'
})
export class VisexhibService {

  sub_visex: Subscription;
  visex: BehaviorSubject<SubData> = new BehaviorSubject(new SubData(new Array(), 'pending'));

  sub_model_visex: Subscription;
  model_visex: SubData;

  constructor(
    private module: ModulesService,
    private server: ServerService
  ) { }

  getVisitors(idExhib: number): void{
    this.visex.next(new SubData(new Array(), 'pending'));
    this.sub_visex = this.server.getVisitors(idExhib).pipe(
      map((vl:any): IVisitorExhib[] => Array.from(vl))
    ).subscribe(data=>{
      console.log('data from getVisitors: ', data);
      this.sub_visex.unsubscribe();
      this.visex.next(new SubData(data, 'ready'));
      //this.eventController();
    })
  }

  getModel(): void{
    this.sub_model_visex = this.visex.subscribe(data => this.model_visex = data);
  }

}
