import { Injectable } from '@angular/core';
import { ModulesService } from '../../shared/modules.service';

@Injectable({
  providedIn: 'root'
})
export class Fields {
  private allFields: string[] = [
    'regnum',
    'name',
    'prizv',
    'namepovne',
    'countryid',
    'postindeks',
    'regionid',
    'city',
    'address',
    'postaddreses',
    'telephon',
    'pobatkovi',
    'gender',
    'm_robotu',
    'sferadij',
    'posada',
    'type',
    'kompeten',
    'potvid',
    'email',
    'datawnesenny ',
    'datelastcor',
    'rating',
    'ins_user',
    'cellphone',
    'userid',
    'realname',
    'reg_countryid',
    'reg_regionid',
    'country',
    //'reg2_countryid',
    //'reg2_regionid',
    'region',
    'cityid',
    'id_visitor',
    'visited_exhib',
    'sending'
  ];
  private visFields: string[] = [];

  constructor(private module: ModulesService,) {}
  
  selected() : string {
    //console.log('this.allFields from Fields selected()', this.allFields); 
    return this.visFields.join(', ')
  }

  allColumns(): string[]{
    //console.log('this.allFields from Fields allColumns()', this.allFields);
    return this.allFields
  }

  setFields(v : string[]) {
    v.forEach(element => {
      if(this.allFields.includes(element)) {
        if(!this.visFields.includes(element)) this.visFields.push(element)
      }
    });
    //console.log('this.allFields from Fields setFields()', this.allFields);
  }

  delField(field: string){
    this.visFields.splice(this.module.checkArrIdVal(this.visFields, field), 1);
    //console.log('this.allFields from Fields delField()', this.allFields);
  }
  


}


