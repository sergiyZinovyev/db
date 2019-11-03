import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {

  constructor() { }

  dictionary: {id: string, ukr: string}[] = [
    {
      id: 'realname',
      ukr: 'Вніс дані'
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
    {
      id: 'regnum',
      ukr: 'ID відвідувача'
    },
    {
      id: 'email',
      ukr: 'електронна пошта'
    },
    {
      id: 'city',
      ukr: 'місто'
    },
    {
      id: 'sferadij',
      ukr: 'сфера діяльності'
    },
    {
      id: 'posada',
      ukr: 'посада'
    },
    {
      id: 'type',
      ukr: 'рівень'
    },
    {
      id: 'potvid',
      ukr: 'потенційне відвідування'
    },
    {
      id: 'datawnesenny',
      ukr: 'дата внесення'
    },
    {
      id: 'select',
      ukr: 'обрати'
    },
    {
      id: 'prizv',
      ukr: 'прізвище'
    },
    {
      id: 'countryid',
      ukr: 'ID країни'
    },
    {
      id: 'country',
      ukr: 'країна'
    },
    {
      id: 'postindeks',
      ukr: 'поштовий індекс'
    },
    {
      id: 'regionid',
      ukr: 'ID регіону'
    },
    {
      id: 'region',
      ukr: 'регіон'
    },
    {
      id: 'address',
      ukr: 'поштова адреса'
    },
    {
      id: 'postaddreses',
      ukr: 'повна адреса'
    },
    {
      id: 'telephon',
      ukr: 'телефон'
    },
    {
      id: 'pobatkovi',
      ukr: 'по батькові'
    },
    {
      id: 'gender',
      ukr: 'стать'
    },
    {
      id: 'kompeten',
      ukr: 'компетенція'
    },
    {
      id: 'datelastcor',
      ukr: 'останнє редагування'
    },
    {
      id: 'rating',
      ukr: 'рейтинг'
    },
    {
      id: 'ins_user',
      ukr: 'ID користувача'
    },
    {
      id: 'visited_exhib',
      ukr: 'відвідані виставки'
    },
    {
      id: 'xxxxxxxxx',
      ukr: 'xxxxxxxxxx'
    },
  ]


}
