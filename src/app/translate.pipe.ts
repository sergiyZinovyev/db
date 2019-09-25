import { Pipe, PipeTransform } from '@angular/core';
import { DictionaryService } from './shared/dictionary.service';

@Pipe({
  name: 'translate'
})
export class TranslatePipe implements PipeTransform {

  constructor(
    private translate: DictionaryService
  ) {}


  checkArrIdVal(array, val) {
    for (let i: number = 0; i < array.length; i++){
      if (array[i].id === val){
        return i;
      }
    }
    return undefined;
  }

  transform(value, arg) {
    let id = this.checkArrIdVal(this.translate.dictionary, value);
    if (id >= 0){
      if(arg == 'ukr'){
        return this.translate.dictionary[id].ukr;
      }
      else{return value}
    }
    return value
  }

}
