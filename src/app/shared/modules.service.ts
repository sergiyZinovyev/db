import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModulesService {

  constructor() { }

  // знаходить номер елемента в масиві по його значенню, повертає номер
  checkArrIdVal(array: any[], val: any):number {
    for (let i: number = 0; i < array.length; i++){
      if (array[i] === val){
        return i;
      }
    }
  }

  // знаходить номер елемента в масиві об'єктів по значенню заданої властивості об'єкта, повертає номер
  checkArrOfObjIdVal(array: any, val: any):number {
    if(!array){console.log('array is undefined')}
    for (let i: number = 0; i < array.length; i++){
      console.log('array: ', array);
      console.log('array[i]: ', array[i]);
      console.log('val: ', val);
      if (array[i].fild = val){
        console.log('icheckArrOfObjIdVal: ', i)
        return i;
      }
    }
  }
  
}
