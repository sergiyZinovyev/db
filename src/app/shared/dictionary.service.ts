import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  constructor() { }

  dictionary: {id: string, ukr: string}[] = [
    {
      id: 'realname',
      ukr: 'Зареєстрував'
    },
    {
      id: 'id_visitor',
      ukr: 'ID відвідувача'
    },
    {
      id: 'date_vis',
      ukr: 'Дата візиту'
    },
    {
      id: 'namepovne',
      ukr: "Ім'я"
    },
    {
      id: 'cellphone',
      ukr: 'Моб. телефон'
    },
    {
      id: 'visited',
      ukr: 'К-ть візитів'
    },
    {
      id: 'm_robotu',
      ukr: 'місце роботи'
    },

  ]


}
