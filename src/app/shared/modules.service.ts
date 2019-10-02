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
    if(!array){
      console.log('array is undefined');
      return;
    }
    for (let i: number = 0; i < array.length; i++){
      if (array[i].fild == val){
        return i;
      }
    }
  }

  // Додає текст до початку строки кожному елементу масива(value: масив строк, text: який треба додати)
  addText(arr: string[], text: string): string[]{
    return arr = arr.map( item => {
      return text+item;
    })
  }

  // фільтрує за вказаним значенням (data: масив об'єктів для фільтрації, filterValue: значення для фільтру, fild: поле фільтрації)
  // повертає новий масив
  filter(data: {}[], filterValue: any, fild: string) {
    //let data = this.viewData
    //визначаємо тип даних в полі для пошуку
    let type = typeof(data[0][fild]);
    if(!filterValue){
      //якщо поле для пошуку пусте то повертаємо всі дані
      return data
    }
    if(type == 'number'){
      // якщо тип даних number тоді..
      data = data.filter( item => {
        return item[fild] == filterValue;
      })
    }
    else{
      // якщо тип даних інший тоді..
      if (Array.isArray(filterValue)){
        console.log('value is array: ', filterValue);
        for(let val of filterValue){
          data = data.filter( item => {
            return String(item[fild]).toLowerCase().includes(String(val).toLowerCase());
          })
        }
      }
      else{
        data = data.filter( item => {
          return String(item[fild]).toLowerCase().includes(String(filterValue).toLowerCase());
        })
      }
      
    }
    return data
  }

  // керуємо масивом даних для фільтрації (filterData - масив даних, value - нове значення, fildName - поле для фільтрації)
  // повертає новий масив даних
  addFiltrData(filterData: {filterValue: any, fild: string}[], value: any, fildName: string):{filterValue: any, fild: string}[]{
    // перевіряємо чи існує таке поле та повертаємо його номер в масиві 
    let i = this.checkArrOfObjIdVal(filterData, fildName)
    if(i >= 0){
      console.log('поле існує під номером '+i);
      filterData[i].filterValue = value
    }
    else{
      console.log('поле не існує!');
      filterData.push({
        fild: fildName,
        filterValue: value 
      })
    }

    console.log('filterData:', filterData);
    return filterData;
  }

  // форматування дати
  dateFormat(d){
    if(d){
      var now = new Date(d);
      var curr_date = ('0' + now.getDate()).slice(-2)
      var curr_month = ('0' + (now.getMonth() + 1)).slice(-2);
      var curr_year = now.getFullYear();
      var curr_hour = ('0' + now.getHours()).slice(-2);
      var curr_minute = ('0' + now.getMinutes()).slice(-2);
      var curr_second = ('0' + now.getSeconds()).slice(-2);
      var formated_date = curr_year + "-" + curr_month + "-" + curr_date + " " + curr_hour + ":" + curr_minute + ":" + curr_second;
    }
    else {return new Date()};
    return formated_date;
  }
  
}
