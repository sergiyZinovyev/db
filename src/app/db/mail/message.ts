import {IUser, IMessage, IMailingLists, IMessageInfo} from '../../db/mail/mailInterface';


export class Message {
  id: number | string; //id of the email
  subject: string; //subject of the email
  message: string; // body of the email
  attachments: string; // attachments
  body_files: string; // files that are used only in the body of the email
  id_user: number; // id of the person who created the email
  date: string; // email creation date
  changed: boolean; // indicates whether the email has been modified in the process

  mailingId: number; // mailing id
  sendList: IUser[]; //mailing list
  from: string; // sender

  date_start: string; //mailing start date
  date_end: string; //mailing end date
  mailingStatus: 'sent'|'no_sent'|'sending';

  constructor(
    messageData?: IMessage, 
    mailingData?: IMailingLists, 
    mailingListData?: IUser[],
    
  ) {
    if(messageData){
      this.id = messageData.id;
      this.subject = messageData.subject;
      this.message = messageData.message;
      this.attachments = messageData.attachments;
      this.body_files = messageData.body_files;
      this.id_user = messageData.id_user;
      this.date = messageData.date;
    }
    else this.id = 'new';

    if(mailingData){
      this.mailingId = mailingData.id;
      this.from = mailingData.sender;
      this.date_start = mailingData.date_start;
      this.date_end = mailingData.date_end;
      if(mailingData.date_end){
        this.mailingStatus = 'sent'
      }
      else this.mailingStatus = 'no_sent'
    }
    else this.from = 'send@galexpo.lviv.ua';

    if(mailingListData) {this.sendList = mailingListData}
    else this.sendList = [];

    this.changed = false;
  }
  
  public get to(): string { // email list for display only
    if(this.sendList.length > 0) return this.sendList.slice(0, 10).map((el: IUser) => el.email).join('; ')
    else return '';
  }

  private checkArrOfObjIdValField(array: any, field: any, val: any):number {
    if(!array){
      console.log('array is undefined');
      return;
    }
    if(!array[0][field]){
      console.log(`field - ${field} in array is undefined`);
      return;
    }
    for (let i: number = 0; i < array.length; i++){
      if (array[i][field] == val){
        return i;
      }
    }
    return;
  }  

  addToSendList(v : IUser[]) {
    let newArray = [];
    let newList = this.sendList.concat(v);
    //remove duplicates
    for (let index = 0; index < newList.length; index++) {
      let element = newList[index];
      if(element.email && newArray.filter(item => item.email == element.email).length < 1){
        newArray.push(element);
      }
    }
    this.sendList = newArray;
  }

  removeFromSendList(id: number){
    let numberOfArr = this.checkArrOfObjIdValField(this.sendList, 'regnum', id);
    if(numberOfArr>=0){
      this.sendList.splice(numberOfArr, 1);
      return
    }
  }

  updateSendList(data: IUser){
    let numberOfArr = this.checkArrOfObjIdValField(this.sendList, 'id', data.id);
    if(numberOfArr>=0){
      this.sendList.splice(numberOfArr, 1, data);
      return
    }
    else return -1
  }

  clearSendList(){
    this.sendList = [];
  }

  setKey(...keys:{key: string, val: any}[]){
    for(let argument of keys){
      if(argument.val){
        this[argument.key] = argument.val
      }
    }
  }

}


